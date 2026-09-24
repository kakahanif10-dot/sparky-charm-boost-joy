import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const HF_BASE = "https://higgsfield.ai";
const MODELS = { image: "flux", video: "kling" } as const;

// Keyword -> template matcher (no AI tokens used)
export const matchTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ prompt: z.string().min(1).max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: libs, error } = await context.supabase.from("code_libraries").select("*");
    if (error) throw new Error("Gagal memuat template");
    const text = data.prompt.toLowerCase();
    const hit = libs?.find((l) => l.keywords.some((k: string) => text.includes(k))) ?? libs?.[0];
    return hit ?? null;
  });

export const createHiggsfieldTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ task_type: z.enum(["image", "video"]), prompt: z.string().min(1).max(2000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const model = MODELS[data.task_type];
    const { data: task, error } = await context.supabase
      .from("higgsfield_tasks")
      .insert({ user_id: context.userId, task_type: data.task_type, prompt: data.prompt, model })
      .select()
      .single();
    if (error || !task) throw new Error("Gagal membuat task");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const key = process.env["HIGGSFIELD_API_KEY"];
    if (!key) {
      await supabaseAdmin.from("higgsfield_tasks").update({ status: "failed", error: "API key belum diatur" }).eq("id", task.id);
      return { id: task.id, status: "failed" as const };
    }
    try {
      const origin = new URL(process.env["PUBLIC_APP_URL"] ?? "https://sparky-charm-boost-joy.lovable.app").origin;
      const res = await fetch(`${HF_BASE}/v1/generations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          type: data.task_type,
          prompt: data.prompt,
          webhook_url: `${origin}/api/public/higgsfield-webhook?task=${task.id}`,
        }),
      });
      const json: any = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message ?? `HTTP ${res.status}`);
      await supabaseAdmin
        .from("higgsfield_tasks")
        .update({ status: "processing", external_id: json.id ?? json.task_id ?? null })
        .eq("id", task.id);
      return { id: task.id, status: "processing" as const };
    } catch (e) {
      console.error("Higgsfield error", e);
      await supabaseAdmin.from("higgsfield_tasks").update({ status: "failed", error: "Layanan generasi gagal" }).eq("id", task.id);
      return { id: task.id, status: "failed" as const };
    }
  });

// Polling fallback: checks status at Higgsfield and updates row
export const refreshHiggsfieldTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: task } = await context.supabase.from("higgsfield_tasks").select("*").eq("id", data.id).single();
    if (!task?.external_id || task.status !== "processing") return task;
    const key = process.env["HIGGSFIELD_API_KEY"];
    if (!key) return task;
    const res = await fetch(`${HF_BASE}/v1/generations/${task.external_id}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const json: any = await res.json().catch(() => ({}));
    const status = ["completed", "failed"].includes(json.status) ? json.status : "processing";
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: updated } = await supabaseAdmin
      .from("higgsfield_tasks")
      .update({ status, result_url: json.result_url ?? json.output?.url ?? null })
      .eq("id", task.id)
      .select()
      .single();
    return updated;
  });

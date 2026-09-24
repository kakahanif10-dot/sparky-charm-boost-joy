import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  id: z.string().optional(),
  task_id: z.string().optional(),
  status: z.string(),
  result_url: z.string().url().optional(),
  output: z.object({ url: z.string().url() }).partial().optional(),
});

export const Route = createFileRoute("/api/public/higgsfield-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const taskId = url.searchParams.get("task");
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!taskId || !parsed.success) return new Response("Bad request", { status: 400 });
        const externalId = parsed.data.id ?? parsed.data.task_id;
        if (!externalId) return new Response("Bad request", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        // Verify caller: task id + external id must match a processing row
        const { data: task } = await supabaseAdmin
          .from("higgsfield_tasks")
          .select("id")
          .eq("id", taskId)
          .eq("external_id", externalId)
          .maybeSingle();
        if (!task) return new Response("Not found", { status: 404 });

        const s = parsed.data.status;
        const status = s === "completed" || s === "failed" ? s : "processing";
        await supabaseAdmin
          .from("higgsfield_tasks")
          .update({ status, result_url: parsed.data.result_url ?? parsed.data.output?.url ?? null })
          .eq("id", taskId);
        return new Response("ok");
      },
    },
  },
});

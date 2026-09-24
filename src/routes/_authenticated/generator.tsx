import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { matchTemplate, createHiggsfieldTask } from "@/lib/higgsfield.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/generator")({
  head: () => ({
    meta: [
      { title: "App Generator — SUPERINTELLIGENS" },
      { name: "description", content: "Buat aplikasi web dan mobile secara instan dari template siap pakai." },
      { property: "og:title", content: "App Generator — SUPERINTELLIGENS" },
      { property: "og:description", content: "Buat aplikasi web dan mobile secara instan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GeneratorPage,
});

type Tpl = { name: string; niche: string; template_code: string; mock_assets: Record<string, string> };
type Task = { id: string; task_type: string; prompt: string; status: string; result_url: string | null };

const STEPS = ["Menganalisis ide...", "Menyusun tampilan...", "Menyiapkan gambar...", "Selesai!"];

function GeneratorPage() {
  const match = useServerFn(matchTemplate);
  const createTask = useServerFn(createHiggsfieldTask);
  const [prompt, setPrompt] = useState("");
  const [appName, setAppName] = useState("Aplikasiku");
  const [platform, setPlatform] = useState<"web" | "mobile">("web");
  const [step, setStep] = useState(-1);
  const [tpl, setTpl] = useState<Tpl | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hfPrompt, setHfPrompt] = useState("");

  async function loadTasks() {
    const { data } = await supabase.from("higgsfield_tasks").select("*").order("created_at", { ascending: false }).limit(10);
    setTasks((data as Task[]) ?? []);
  }
  useEffect(() => {
    loadTasks();
    const ch = supabase
      .channel("hf-tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "higgsfield_tasks" }, loadTasks)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  async function generate() {
    if (!prompt.trim()) return;
    setTpl(null);
    const resP = match({ data: { prompt } });
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 800));
    }
    setTpl((await resP) as Tpl | null);
  }

  const img = tpl ? Object.values(tpl.mock_assets)[0] : undefined;

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      <h1 className="text-3xl font-bold text-foreground">App & Web Generator</h1>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border bg-card p-5">
          <input className="w-full rounded-md border bg-background p-2" value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="Nama aplikasi" />
          <textarea className="w-full rounded-md border bg-background p-2" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder='Contoh: "Aplikasi toko seperti Shopee"' />
          <div className="flex gap-2">
            {(["web", "mobile"] as const).map((p) => (
              <Button key={p} variant={platform === p ? "default" : "outline"} onClick={() => setPlatform(p)}>
                {p === "web" ? "Web" : "Mobile (APK)"}
              </Button>
            ))}
          </div>
          <Button className="w-full" onClick={generate} disabled={step >= 0 && step < STEPS.length - 1 && !tpl}>Buat Aplikasi</Button>
          {step >= 0 && <p className="text-sm text-muted-foreground">{STEPS[step]}</p>}
          {tpl && (
            <Button variant="ghost" size="sm" onClick={() => setShowCode((s) => !s)}>{showCode ? "Sembunyikan kode" : "Lihat kode"}</Button>
          )}
          {tpl && showCode && (
            <pre className="max-h-64 overflow-auto rounded bg-muted p-3 text-xs">{tpl.template_code.replace("{{APP_NAME}}", appName)}</pre>
          )}
        </div>

        <div className="flex justify-center rounded-xl border bg-muted p-5">
          <div className={`${platform === "mobile" ? "w-[280px] h-[520px] rounded-[2rem] border-8" : "w-full h-[400px] rounded-lg border"} overflow-auto border-foreground/80 bg-background p-4`}>
            {tpl ? (
              <div className="space-y-3">
                <h2 className="text-xl font-bold">{appName}</h2>
                <p className="text-xs text-muted-foreground">Template: {tpl.name}</p>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded border p-2">
                      {img && <img src={img} alt="" className="aspect-square w-full rounded" />}
                      <p className="mt-1 text-sm">Item {i}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground mt-20">Pratinjau muncul di sini</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="text-xl font-semibold">Aset Kustom (Higgsfield)</h2>
        <input className="w-full rounded-md border bg-background p-2" value={hfPrompt} onChange={(e) => setHfPrompt(e.target.value)} placeholder="Deskripsikan gambar atau video" />
        <div className="flex gap-2">
          {(["image", "video"] as const).map((t) => (
            <Button key={t} variant="outline" disabled={!hfPrompt.trim()} onClick={async () => { await createTask({ data: { task_type: t, prompt: hfPrompt } }); loadTasks(); }}>
              Buat {t === "image" ? "Gambar" : "Video"}
            </Button>
          ))}
        </div>
        <ul className="divide-y">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-2 text-sm">
              <span className="truncate">{t.task_type}: {t.prompt}</span>
              {t.result_url ? <a className="text-primary underline" href={t.result_url} target="_blank" rel="noreferrer">Buka</a> : <span className="text-muted-foreground">{t.status}</span>}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

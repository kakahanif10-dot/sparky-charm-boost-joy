CREATE TABLE public.higgsfield_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type text NOT NULL CHECK (task_type IN ('video','image')),
  prompt text NOT NULL,
  model text,
  external_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  result_url text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.higgsfield_tasks TO authenticated;
GRANT ALL ON public.higgsfield_tasks TO service_role;
ALTER TABLE public.higgsfield_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own tasks select" ON public.higgsfield_tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own tasks insert" ON public.higgsfield_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER trg_hf_updated BEFORE UPDATE ON public.higgsfield_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER PUBLICATION supabase_realtime ADD TABLE public.higgsfield_tasks;

CREATE TABLE public.code_libraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  niche text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  platforms text[] NOT NULL DEFAULT '{web,mobile}',
  template_code text NOT NULL,
  mock_assets jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.code_libraries TO anon, authenticated;
GRANT ALL ON public.code_libraries TO service_role;
ALTER TABLE public.code_libraries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Templates are public" ON public.code_libraries FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.code_libraries (slug,name,niche,keywords,template_code,mock_assets) VALUES
('ecommerce','Toko Online','e-commerce',ARRAY['shopee','tokopedia','toko','shop','ecommerce','jualan'],
'export default function App(){const items=[{n:"Produk A",p:"Rp49.000"},{n:"Produk B",p:"Rp79.000"}];return(<div className="p-4"><h1 className="text-xl font-bold">{"{{APP_NAME}}"}</h1><div className="grid grid-cols-2 gap-3 mt-4">{items.map(i=><div key={i.n} className="border rounded p-3"><img src={ASSETS.product}/><p>{i.n}</p><b>{i.p}</b></div>)}</div></div>)}',
'{"product":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlNGQyZCIvPjwvc3ZnPg=="}'),
('laundry','Laundry','laundry',ARRAY['laundry','cuci','binatu'],
'export default function App(){const s=["Cuci Kering","Setrika","Express"];return(<div className="p-4"><h1 className="text-xl font-bold">{"{{APP_NAME}}"}</h1><img src={ASSETS.logo}/><ul>{s.map(x=><li key={x} className="border-b py-2">{x}</li>)}</ul><button className="mt-4 w-full rounded bg-blue-600 p-2 text-white">Pesan Pickup</button></div>)}',
'{"logo":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzI1NjNlYiIvPjwvc3ZnPg=="}'),
('coffee','Coffee Shop','coffee shop',ARRAY['kopi','coffee','cafe','kafe'],
'export default function App(){const m=[{n:"Espresso",p:"Rp18.000"},{n:"Latte",p:"Rp25.000"}];return(<div className="p-4"><h1 className="text-xl font-bold">{"{{APP_NAME}}"}</h1><img src={ASSETS.cup}/>{m.map(x=><div key={x.n} className="flex justify-between py-2"><span>{x.n}</span><b>{x.p}</b></div>)}</div>)}',
'{"cup":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSIyNSIgeT0iMzAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgcng9IjgiIGZpbGw9IiM2ZjRlMzciLz48L3N2Zz4="}');
type DenoRuntime = {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

declare const Deno: DenoRuntime;

// TypeScript du workspace ne sait pas resoudre les imports HTTP, mais Deno oui.
// @ts-expect-error URL import resolved by Deno runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  stock: number;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");

    // Fetch products to give context to the AI
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: products } = await supabase
      .from("products")
      .select("id, name, description, price, category, stock");

    const productCatalog = (products ?? [])
      .map(
        (p: Product) =>
          `- ${p.name} (ID: ${p.id}) | ${p.category} | ${p.price}€ | Stock: ${p.stock} | ${p.description} | Lien: /product/${p.id}`,
      )
      .join("\n");

    const systemPrompt = `Tu es l'assistant virtuel multilingue de NovaTech, une boutique e-commerce de produits high-tech.

🌍 LANGUES: Détecte automatiquement la langue de l'utilisateur (français, anglais, arabe, espagnol, allemand, italien, portugais, chinois, etc.) et réponds TOUJOURS dans cette même langue.

🎯 TON RÔLE:
- Accueillir chaleureusement les clients
- Répondre à toutes leurs questions sur les produits, la livraison, les paiements
- Recommander des produits pertinents selon leurs besoins
- Toujours inclure les liens cliquables vers les produits sous la forme markdown: [Nom du produit](/product/ID)
- Mentionner le prix en euros
- Être amical, concis et utile

📦 CATALOGUE DISPONIBLE:
${productCatalog}

💡 IMPORTANT:
- Quand tu recommandes un produit, donne TOUJOURS le lien markdown vers la page produit
- Propose 2-3 produits maximum par réponse, sauf si l'utilisateur demande plus
- Si un produit n'existe pas dans le catalogue, dis-le honnêtement
- Pour finaliser un achat, invite l'utilisateur à cliquer sur "Ajouter au panier" puis "Checkout"`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://novatech.app",
          "X-Title": "NovaTech Shop",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      },
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("OpenRouter error:", response.status, t);
      return new Response(
        JSON.stringify({ error: `AI gateway error: ${response.status}` }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

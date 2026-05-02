import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { ChatWidget } from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, ShieldCheck, Truck } from "lucide-react";

type Product = {
  id: string; name: string; description: string | null;
  price: number; image_url: string | null; category: string | null; stock: number;
};

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string>("Tous");

  useEffect(() => {
    document.title = "NovaTech — Boutique High-Tech avec Assistant IA Multilingue";
    supabase.from("products").select("*").order("created_at").then(({ data }) => {
      setProducts((data ?? []) as Product[]);
    });
  }, []);

  const categories = ["Tous", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[]))];
  const filtered = category === "Tous" ? products : products.filter((p) => p.category === category);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="container mx-auto px-4 py-20 sm:py-28 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
              <Sparkles className="w-4 h-4" /> Assistant IA multilingue inclus
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold leading-[1.05]">
              La tech qui <span className="text-gradient">vous parle</span><br />
              dans votre langue
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez nos produits high-tech soigneusement sélectionnés et laissez-vous guider par Nova, votre conseiller IA disponible 24/7 dans toutes les langues.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button size="lg" className="bg-gradient-hero border-0 shadow-vibrant text-base h-12 px-8" asChild>
                <a href="#produits">Explorer la boutique</a>
              </Button>
              <Button size="lg" variant="outline" className="text-base h-12 px-8 border-2" onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="Ouvrir le chat"]')?.click()}>
                <MessageCircle className="w-4 h-4 mr-2" /> Parler à Nova
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto">
            {[
              { icon: MessageCircle, t: "Chat IA 24/7", d: "Toutes les langues" },
              { icon: Truck, t: "Livraison rapide", d: "48h en France" },
              { icon: ShieldCheck, t: "Paiement sécurisé", d: "Garantie 2 ans" },
            ].map((f, i) => (
              <div key={i} className="bg-gradient-card border border-border rounded-2xl p-5 text-center shadow-card-soft">
                <f.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <h3 className="font-bold">{f.t}</h3>
                <p className="text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="produits" className="container mx-auto px-4 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold">Notre catalogue</h2>
            <p className="text-muted-foreground mt-2">{filtered.length} produits disponibles</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-smooth ${
                  category === c
                    ? "bg-gradient-primary text-white shadow-glow"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <footer className="border-t border-border mt-20 py-8 text-center text-sm text-muted-foreground">
        © 2026 NovaTech — Assistant IA propulse par OpenRouter
      </footer>

      <ChatWidget />
    </div>
  );
};

export default Index;

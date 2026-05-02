import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ChatWidget } from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { ShoppingCart, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string; name: string; description: string | null;
  price: number; image_url: string | null; category: string | null; stock: number;
};

const ProductDetail = () => {
  const { id } = useParams();
  const [p, setP] = useState<Product | null>(null);
  const { add } = useCart();

  useEffect(() => {
    if (!id) return;
    supabase.from("products").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setP(data as Product | null);
      if (data) document.title = `${data.name} — NovaTech`;
    });
  }, [id]);

  if (!p) return (
    <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto p-12 text-center text-muted-foreground">Chargement…</div></div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour à la boutique
        </Link>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="bg-gradient-card rounded-3xl overflow-hidden shadow-card-soft border border-border">
            <img src={p.image_url ?? "/placeholder.svg"} alt={p.name} className="w-full aspect-square object-cover" />
          </div>
          <div className="space-y-5">
            {p.category && (
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-accent/20 text-accent-foreground">{p.category}</span>
            )}
            <h1 className="text-4xl font-bold">{p.name}</h1>
            <p className="text-3xl font-bold text-gradient">{p.price}€</p>
            <p className="text-muted-foreground leading-relaxed">{p.description}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary" /> {p.stock} en stock · Livraison 48h
            </div>
            <Button
              size="lg"
              className="bg-gradient-hero border-0 shadow-vibrant w-full sm:w-auto h-12 px-8"
              onClick={() => {
                add({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url });
                toast.success("Ajouté au panier !");
              }}
            >
              <ShoppingCart className="w-5 h-5 mr-2" /> Ajouter au panier
            </Button>
          </div>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
};

export default ProductDetail;

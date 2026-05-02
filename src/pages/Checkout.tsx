import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  first_name: z.string().trim().min(1, "Prénom requis").max(80),
  last_name: z.string().trim().min(1, "Nom requis").max(80),
  email: z.string().trim().email("Email invalide").max(255),
  phone: z.string().trim().min(6, "Téléphone requis").max(30),
  address: z.string().trim().min(5, "Adresse requise").max(300),
});

const Checkout = () => {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user.id ?? null;
      setUserId(uid);
      if (!uid) { navigate("/auth?redirect=/checkout"); return; }
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle().then(({ data: p }) => {
        if (p) setForm({
          first_name: p.first_name ?? "",
          last_name: p.last_name ?? "",
          email: p.email ?? data.session!.user.email ?? "",
          phone: p.phone ?? "",
          address: p.address ?? "",
        });
      });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { toast.error("Votre panier est vide"); return; }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message); return;
    }
    if (!userId) { navigate("/auth?redirect=/checkout"); return; }

    setLoading(true);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: userId,
      customer_first_name: parsed.data.first_name,
      customer_last_name: parsed.data.last_name,
      customer_email: parsed.data.email,
      customer_phone: parsed.data.phone,
      customer_address: parsed.data.address,
      total,
    }).select().single();

    if (error || !order) {
      toast.error("Erreur lors de la commande");
      setLoading(false); return;
    }

    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((i) => ({ order_id: order.id, product_id: i.id, product_name: i.name, quantity: i.quantity, price: i.price }))
    );
    if (itemsErr) { toast.error("Erreur articles"); setLoading(false); return; }

    // also update profile with latest info
    await supabase.from("profiles").update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      phone: parsed.data.phone,
      address: parsed.data.address,
      email: parsed.data.email,
    }).eq("id", userId);

    clear();
    toast.success("Commande validée ! 🎉");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Finaliser ma commande</h1>

        <form onSubmit={submit} className="grid md:grid-cols-2 gap-6 bg-gradient-card rounded-3xl p-6 sm:p-8 shadow-card-soft border border-border">
          <div className="space-y-2">
            <Label>Prénom *</Label>
            <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required maxLength={80} />
          </div>
          <div className="space-y-2">
            <Label>Nom *</Label>
            <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required maxLength={80} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Téléphone *</Label>
            <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required maxLength={30} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Adresse de livraison *</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required maxLength={300} />
          </div>

          <div className="md:col-span-2 border-t border-border pt-4 mt-2">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Total à payer</span>
              <span className="text-3xl font-bold text-gradient">{total.toFixed(2)}€</span>
            </div>
            <Button type="submit" disabled={loading} size="lg" className="w-full bg-gradient-hero border-0 shadow-vibrant h-12 text-base">
              {loading ? "Traitement..." : "Confirmer et payer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

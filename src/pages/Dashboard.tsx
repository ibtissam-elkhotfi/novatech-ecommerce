import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Package } from "lucide-react";

type Profile = { first_name: string | null; last_name: string | null; email: string | null; phone: string | null; address: string | null; };
type Order = { id: string; total: number; status: string; created_at: string; customer_first_name: string };

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({ first_name: "", last_name: "", email: "", phone: "", address: "" });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Mon compte — NovaTech";
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user.id;
      if (!uid) { navigate("/auth"); return; }
      setUserId(uid);
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle().then(({ data: p }) => {
        if (p) setProfile({
          first_name: p.first_name ?? "", last_name: p.last_name ?? "",
          email: p.email ?? data.session!.user.email ?? "", phone: p.phone ?? "", address: p.address ?? "",
        });
      });
      supabase.from("orders").select("id, total, status, created_at, customer_first_name").order("created_at", { ascending: false }).then(({ data: o }) => {
        setOrders((o ?? []) as Order[]);
      });
    });
  }, [navigate]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").upsert({
      id: userId, ...profile, updated_at: new Date().toISOString(),
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Profil enregistré !");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <h1 className="text-4xl font-bold mb-8">Mon tableau de bord</h1>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gradient-card rounded-3xl p-6 sm:p-8 shadow-card-soft border border-border">
            <h2 className="text-2xl font-bold mb-4">Mes informations</h2>
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input value={profile.first_name ?? ""} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} maxLength={80} />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={profile.last_name ?? ""} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} maxLength={80} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={profile.email ?? ""} onChange={(e) => setProfile({ ...profile, email: e.target.value })} maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input type="tel" value={profile.phone ?? ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} maxLength={30} />
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input value={profile.address ?? ""} onChange={(e) => setProfile({ ...profile, address: e.target.value })} maxLength={300} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-primary border-0 shadow-glow h-11">
                {loading ? "..." : "Enregistrer"}
              </Button>
            </form>
          </div>

          <div className="bg-gradient-card rounded-3xl p-6 sm:p-8 shadow-card-soft border border-border">
            <h2 className="text-2xl font-bold mb-4">Mes commandes</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                Aucune commande pour l'instant
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                    <div>
                      <p className="font-semibold text-sm">#{o.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gradient">{Number(o.total).toFixed(2)}€</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

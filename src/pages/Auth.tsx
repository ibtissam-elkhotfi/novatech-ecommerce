import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [signup, setSignup] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [signin, setSignin] = useState({ email: "", password: "" });

  useEffect(() => {
    document.title = "Connexion — NovaTech";
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(redirect);
    });
  }, [navigate, redirect]);

  const doSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signup.email,
      password: signup.password,
      options: {
        emailRedirectTo: `${window.location.origin}${redirect}`,
        data: { first_name: signup.first_name, last_name: signup.last_name },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Compte créé !");
    navigate(redirect);
  };

  const doSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(signin);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Bienvenue !");
    navigate(redirect);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="bg-gradient-card rounded-3xl p-8 shadow-vibrant border border-border">
          <h1 className="text-3xl font-bold text-center mb-2">Bienvenue chez <span className="text-gradient">NovaTech</span></h1>
          <p className="text-center text-muted-foreground mb-6">Créez votre compte ou connectez-vous</p>

          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={doSignin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={signin.email} onChange={(e) => setSignin({ ...signin, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Mot de passe</Label>
                  <Input type="password" required minLength={6} value={signin.password} onChange={(e) => setSignin({ ...signin, password: e.target.value })} />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-primary border-0 shadow-glow h-11">
                  {loading ? "..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={doSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input required value={signup.first_name} onChange={(e) => setSignup({ ...signup, first_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input required value={signup.last_name} onChange={(e) => setSignup({ ...signup, last_name: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Mot de passe</Label>
                  <Input type="password" required minLength={6} value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-hero border-0 shadow-vibrant h-11">
                  {loading ? "..." : "Créer mon compte"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;

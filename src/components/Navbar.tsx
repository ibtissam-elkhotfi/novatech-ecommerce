import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShoppingCart, User, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";

export const Navbar = () => {
  const { count } = useCart();
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow group-hover:scale-110 transition-bounce">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">NovaTech</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/" className="px-3 py-2 text-sm font-medium hover:text-primary transition-smooth">Boutique</Link>
          {userId ? (
            <>
              <Link to="/dashboard" className="hidden sm:block px-3 py-2 text-sm font-medium hover:text-primary transition-smooth">Mon compte</Link>
              <Button variant="ghost" size="icon" onClick={logout} title="Déconnexion">
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm"><User className="w-4 h-4 mr-1" /> Connexion</Button>
            </Link>
          )}
          <Link to="/cart">
            <Button variant="default" size="sm" className="bg-gradient-primary border-0 shadow-glow relative">
              <ShoppingCart className="w-4 h-4" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

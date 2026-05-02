import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ChatWidget } from "@/components/ChatWidget";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";

const Cart = () => {
  const { items, remove, setQty, total } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Mon panier</h1>

        {items.length === 0 ? (
          <div className="bg-gradient-card border border-border rounded-3xl p-12 text-center shadow-card-soft">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-6">Votre panier est vide</p>
            <Link to="/"><Button className="bg-gradient-primary border-0">Découvrir nos produits</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-gradient-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-card-soft">
                <img src={item.image_url ?? "/placeholder.svg"} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.price}€ / unité</p>
                </div>
                <div className="flex items-center gap-1 bg-muted rounded-full">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setQty(item.id, item.quantity - 1)}><Minus className="w-3 h-3" /></Button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setQty(item.id, item.quantity + 1)}><Plus className="w-3 h-3" /></Button>
                </div>
                <p className="font-bold w-20 text-right">{(item.price * item.quantity).toFixed(2)}€</p>
                <Button variant="ghost" size="icon" onClick={() => remove(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            ))}

            <div className="bg-gradient-hero text-white rounded-3xl p-6 mt-8 shadow-vibrant">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg">Total</span>
                <span className="text-3xl font-bold">{total.toFixed(2)}€</span>
              </div>
              <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 font-bold h-12" onClick={() => navigate("/checkout")}>
                Passer au paiement
              </Button>
            </div>
          </div>
        )}
      </div>
      <ChatWidget />
    </div>
  );
};

export default Cart;

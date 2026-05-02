import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock: number;
};

export const ProductCard = ({ product }: { product: Product }) => {
  const { add } = useCart();

  return (
    <div className="group relative bg-gradient-card rounded-2xl overflow-hidden shadow-card-soft hover:shadow-vibrant transition-bounce hover:-translate-y-2 border border-border">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.image_url ?? "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-bounce"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-5 space-y-3">
        {product.category && (
          <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-accent/20 text-accent-foreground">
            {product.category}
          </span>
        )}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-lg leading-tight hover:text-primary transition-smooth line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl font-bold text-gradient">{product.price}€</span>
          <Button
            size="sm"
            className="bg-gradient-primary border-0 shadow-glow"
            onClick={(e) => {
              e.preventDefault();
              add({ id: product.id, name: product.name, price: Number(product.price), image_url: product.image_url });
              toast.success(`${product.name} ajouté au panier`);
            }}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

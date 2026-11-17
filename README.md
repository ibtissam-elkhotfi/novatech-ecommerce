# NovaTech : boutique high-tech avec assistant IA multilingue

Application e-commerce développée avec **React**, **TypeScript** et **Supabase**.
Les clients parcourent un catalogue de produits high-tech, ajoutent des articles au panier,
passent commande et peuvent discuter avec **Nova**, un assistant IA qui répond dans leur langue.

> Projet à but pédagogique : le paiement est simulé (aucune transaction réelle).

## Fonctionnalités

- Catalogue de produits avec filtre par catégorie
- Page détail pour chaque produit
- Panier persistant (sauvegardé dans le navigateur)
- Inscription et connexion (Supabase Auth)
- Validation de commande avec formulaire contrôlé (Zod)
- Tableau de bord : profil et historique des commandes
- Assistant IA multilingue qui recommande des produits du catalogue

## Technologies

| Domaine | Outils |
|---|---|
| Front-end | React, TypeScript, Vite, React Router |
| Interface | Tailwind CSS, shadcn/ui, Lucide |
| Données | Supabase (PostgreSQL, Auth, Row Level Security) |
| Backend | Supabase Edge Function (Deno) + API OpenRouter |
| Formulaires | React Hook Form, Zod |

## Structure du projet

```
src/
  pages/        Index, ProductDetail, Cart, Checkout, Auth, Dashboard
  components/   Navbar, ProductCard, ChatWidget, ui/ (composants shadcn)
  lib/cart.ts   logique du panier (localStorage)
  integrations/supabase/   client et types générés
supabase/
  migrations/   création des tables et règles de sécurité (RLS)
  functions/chat/   fonction serveur de l'assistant IA
```

## Base de données

Tables : `profiles`, `products`, `orders`, `order_items`.
La sécurité par ligne (**RLS**) est activée : chaque utilisateur ne voit et ne crée que ses propres commandes.

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/ibtissam-elkhotfi/novatech-ecommerce.git
cd novatech-ecommerce

# 2. Installer les dépendances
bun install        # ou : npm install

# 3. Configurer l'environnement : créer un fichier .env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...

# 4. Lancer en développement
bun run dev        # ou : npm run dev
```

L'assistant IA nécessite aussi la variable secrète `OPENROUTER_API_KEY`, à définir côté Supabase (Edge Functions → Secrets), jamais dans le code.

## Améliorations prévues

- Calcul du total côté serveur à partir des prix de la base
- Décrémentation du stock après chaque commande
- Intégration d'un vrai moyen de paiement
- Limitation du nombre de requêtes sur l'assistant IA

## Auteure

**Ibtissam El Khotfi**, étudiante en Informatique Appliquée – Science des Données,
Université Chouaïb Doukkali, El Jadida.
[LinkedIn](https://www.linkedin.com/in/ibtissam-elkhotfi/)

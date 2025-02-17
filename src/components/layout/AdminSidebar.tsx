import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Star,
  Truck,
  Mail,
  Settings,
  Tag,
  Shield,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Produits",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Catégories",
    href: "/admin/categories",
    icon: Tag,
  },
  {
    title: "Utilisateurs",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Rôles",
    href: "/admin/roles",
    icon: Shield,
  },
  {
    title: "Commandes",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Avis",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    title: "Fournisseurs",
    href: "/admin/suppliers",
    icon: Truck,
  },
  {
    title: "Livraison",
    href: "/admin/shipping",
    icon: Truck,
  },
  {
    title: "Newsletter",
    href: "/admin/newsletter",
    icon: Mail,
  },
  {
    title: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
  },
];

export const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div className="pb-12 min-h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Administration</h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  location.pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "transparent"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
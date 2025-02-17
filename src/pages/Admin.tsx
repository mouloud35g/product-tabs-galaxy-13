import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Package, Star, Truck, ShoppingCart } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous devez être connecté pour accéder à cette page.",
      });
      navigate("/");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'administration nécessaires.",
      });
      navigate("/");
    }
  };

  const sections = [
    {
      title: "Produits",
      description: "Gérer le catalogue de produits",
      icon: Package,
      path: "/tables",
    },
    {
      title: "Commandes",
      description: "Gérer les commandes clients",
      icon: ShoppingCart,
      path: "/admin/orders",
    },
    {
      title: "Utilisateurs",
      description: "Gérer les profils utilisateurs",
      icon: Users,
      path: "/admin/users",
    },
    {
      title: "Avis",
      description: "Gérer les avis clients",
      icon: Star,
      path: "/admin/reviews",
    },
    {
      title: "Expédition",
      description: "Gérer les tarifs d'expédition",
      icon: Truck,
      path: "/admin/shipping",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord administrateur</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card key={section.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <section.icon className="h-6 w-6 text-muted-foreground" />
                <Button variant="ghost" onClick={() => navigate(section.path)}>
                  Accéder
                </Button>
              </div>
              <CardTitle className="mt-4">{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
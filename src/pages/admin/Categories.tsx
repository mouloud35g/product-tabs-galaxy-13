import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Categories = () => {
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: categories, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log("Fetching categories...");
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
        
      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
      
      return data || [];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action.",
      });
      return;
    }

    try {
      console.log("Adding new category:", newCategory);
      const { error } = await supabase
        .from('product_categories')
        .insert([newCategory]);

      if (error) {
        console.error("Error adding category:", error);
        throw error;
      }

      toast({
        title: "Succès",
        description: "Catégorie ajoutée avec succès.",
      });
      setNewCategory({ name: "", description: "" });
      refetch();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter la catégorie.",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Gestion des catégories</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ajouter une catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Nom de la catégorie"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              required
            />
            <Input
              placeholder="Description"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            />
            <Button type="submit">Ajouter</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Categories;
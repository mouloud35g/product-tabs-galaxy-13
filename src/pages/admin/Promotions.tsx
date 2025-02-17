import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Promotions = () => {
  const [newPromotion, setNewPromotion] = useState({
    name: "",
    description: "",
    discount_percentage: "",
    promotion_type: "percentage",
    start_date: "",
    end_date: "",
    code: "",
    minimum_purchase: "0",
    usage_limit: "",
    product_id: "",
  });
  
  const { toast } = useToast();

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name');
      return data || [];
    },
  });

  const { data: promotions, refetch } = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('promotions')
        .select('*, products(name)')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const promotionData = {
      ...newPromotion,
      discount_percentage: newPromotion.promotion_type === 'percentage' 
        ? parseInt(newPromotion.discount_percentage)
        : null,
      minimum_purchase: parseFloat(newPromotion.minimum_purchase),
      usage_limit: newPromotion.usage_limit 
        ? parseInt(newPromotion.usage_limit)
        : null,
      product_id: newPromotion.product_id || null,
    };

    const { error } = await supabase
      .from('promotions')
      .insert([promotionData]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter la promotion : " + error.message,
      });
    } else {
      toast({
        title: "Succès",
        description: "Promotion ajoutée avec succès.",
      });
      setNewPromotion({
        name: "",
        description: "",
        discount_percentage: "",
        promotion_type: "percentage",
        start_date: "",
        end_date: "",
        code: "",
        minimum_purchase: "0",
        usage_limit: "",
        product_id: "",
      });
      refetch();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Gestion des promotions</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ajouter une promotion</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la promotion</Label>
                <Input
                  id="name"
                  placeholder="Ex: Soldes d'été"
                  value={newPromotion.name}
                  onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Code promo</Label>
                <Input
                  id="code"
                  placeholder="Ex: SUMMER2024"
                  value={newPromotion.code}
                  onChange={(e) => setNewPromotion({ ...newPromotion, code: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="promotion_type">Type de promotion</Label>
                <Select
                  value={newPromotion.promotion_type}
                  onValueChange={(value) => setNewPromotion({ ...newPromotion, promotion_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage</SelectItem>
                    <SelectItem value="fixed_amount">Montant fixe</SelectItem>
                    <SelectItem value="buy_x_get_y">Achetez X, obtenez Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_percentage">Réduction</Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  placeholder={newPromotion.promotion_type === 'percentage' ? "%" : "€"}
                  value={newPromotion.discount_percentage}
                  onChange={(e) => setNewPromotion({ ...newPromotion, discount_percentage: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_id">Produit concerné (optionnel)</Label>
                <Select
                  value={newPromotion.product_id}
                  onValueChange={(value) => setNewPromotion({ ...newPromotion, product_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les produits</SelectItem>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimum_purchase">Achat minimum (€)</Label>
                <Input
                  id="minimum_purchase"
                  type="number"
                  placeholder="0"
                  value={newPromotion.minimum_purchase}
                  onChange={(e) => setNewPromotion({ ...newPromotion, minimum_purchase: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage_limit">Limite d'utilisation</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  placeholder="Illimité"
                  value={newPromotion.usage_limit}
                  onChange={(e) => setNewPromotion({ ...newPromotion, usage_limit: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Date de début</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={newPromotion.start_date}
                  onChange={(e) => setNewPromotion({ ...newPromotion, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Date de fin</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={newPromotion.end_date}
                  onChange={(e) => setNewPromotion({ ...newPromotion, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Description de la promotion"
                value={newPromotion.description}
                onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
              />
            </div>

            <Button type="submit">Ajouter la promotion</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions?.map((promotion) => (
          <Card key={promotion.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{promotion.name}</span>
                {promotion.code && (
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                    {promotion.code}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">{promotion.description}</p>
              <div className="space-y-2">
                <p className="font-bold">
                  {promotion.promotion_type === 'percentage' 
                    ? `${promotion.discount_percentage}% de réduction`
                    : promotion.promotion_type === 'fixed_amount'
                    ? `${promotion.discount_percentage}€ de réduction`
                    : 'Promotion spéciale'}
                </p>
                {promotion.product_id && (
                  <p className="text-sm text-muted-foreground">
                    Applicable sur : {promotion.products?.name}
                  </p>
                )}
                {promotion.minimum_purchase > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Achat minimum : {promotion.minimum_purchase}€
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Du {new Date(promotion.start_date).toLocaleDateString()} au{" "}
                  {new Date(promotion.end_date).toLocaleDateString()}
                </p>
                {promotion.usage_limit && (
                  <p className="text-sm text-muted-foreground">
                    Utilisations : {promotion.times_used} / {promotion.usage_limit}
                  </p>
                )}
                <div className="mt-2">
                  <Badge variant={promotion.active ? "default" : "secondary"}>
                    {promotion.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Promotions;

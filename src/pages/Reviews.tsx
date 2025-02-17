
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Star, MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  products: {
    name: string;
    image_url: string | null;
  };
  profiles: {
    full_name: string | null;
    username: string | null;
  };
}

const Reviews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [selectedRating, setSelectedRating] = useState(5);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          products (
            name,
            image_url
          ),
          profiles (
            full_name,
            username
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });

  const addReview = async (productId: string) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour laisser un avis",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        user_id: user.id,
        rating: selectedRating,
        comment: newComment,
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre avis a été ajouté avec succès",
      });

      setNewComment("");
      setSelectedRating(5);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'avis:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter votre avis",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">Avis Clients</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews?.map((review) => (
          <Card key={review.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{review.products.name}</CardTitle>
                  <CardDescription>
                    par {review.profiles.full_name || review.profiles.username || "Anonyme"}
                  </CardDescription>
                </div>
                <div className="flex items-center">
                  <span className="mr-1">{review.rating}</span>
                  <Star className="h-4 w-4 text-yellow-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-gray-600">{review.comment}</p>
            </CardContent>
            <CardFooter className="text-sm text-gray-500">
              {formatDate(review.created_at)}
            </CardFooter>
          </Card>
        ))}
      </div>

      {user && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ajouter un avis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Star
                  key={rating}
                  className={`h-6 w-6 cursor-pointer ${
                    rating <= selectedRating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                  onClick={() => setSelectedRating(rating)}
                />
              ))}
            </div>
            <Textarea
              placeholder="Partagez votre expérience..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => addReview("product_id")} // Remplacer par l'ID du produit réel
              disabled={!newComment.trim()}
              className="w-full"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Publier l'avis
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Reviews;

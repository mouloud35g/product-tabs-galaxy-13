import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
  active: boolean;
}

const Newsletter = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(
    null
  );

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      console.log("Fetching newsletter subscribers...");
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching subscribers:", error);
        throw error;
      }

      console.log("Subscribers fetched:", data);
      return data as Subscriber[];
    },
  });

  const deleteSubscriberMutation = useMutation({
    mutationFn: async (subscriberId: string) => {
      console.log("Deleting subscriber:", subscriberId);
      const { error } = await supabase
        .from("newsletter_subscribers")
        .delete()
        .eq("id", subscriberId);

      if (error) {
        console.error("Error deleting subscriber:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Abonné supprimé",
        description: "L'abonné a été supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      setSelectedSubscriber(null);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'abonné",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion de la Newsletter</h1>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Date d'inscription</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers?.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell>{subscriber.email}</TableCell>
                <TableCell>
                  {format(new Date(subscriber.created_at), "PPP", {
                    locale: fr,
                  })}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      subscriber.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {subscriber.active ? "Actif" : "Inactif"}
                  </span>
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedSubscriber(subscriber)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Confirmer la suppression
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer cet abonné ? Cette
                          action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            if (selectedSubscriber) {
                              deleteSubscriberMutation.mutate(
                                selectedSubscriber.id
                              );
                            }
                          }}
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Newsletter;
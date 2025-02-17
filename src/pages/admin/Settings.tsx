import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [newSetting, setNewSetting] = useState({
    key: "",
    value: "",
    description: "",
  });
  const { toast } = useToast();

  const { data: settings, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .order('key');
      return data || [];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('site_settings')
      .insert([newSetting]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter le paramètre.",
      });
    } else {
      toast({
        title: "Succès",
        description: "Paramètre ajouté avec succès.",
      });
      setNewSetting({ key: "", value: "", description: "" });
      refetch();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Paramètres du site</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ajouter un paramètre</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Clé"
              value={newSetting.key}
              onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
            />
            <Input
              placeholder="Valeur"
              value={newSetting.value}
              onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={newSetting.description}
              onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
            />
            <Button type="submit">Ajouter</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settings?.map((setting) => (
          <Card key={setting.id}>
            <CardHeader>
              <CardTitle>{setting.key}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono bg-muted p-2 rounded">{setting.value}</p>
              <p className="text-muted-foreground mt-2">{setting.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Settings;
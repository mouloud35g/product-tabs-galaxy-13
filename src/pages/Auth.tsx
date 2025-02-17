import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Setting up auth state change listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change event:", event);
      
      if (event === "SIGNED_IN" && session) {
        console.log("User signed in, redirecting to home");
        navigate("/");
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out, clearing error");
        setError(null);
      }
    });

    // Vérification initiale de la session
    const checkInitialSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("Initial session check:", { session, error: sessionError });
      
      if (session) {
        navigate("/");
      }
      if (sessionError) {
        console.error("Session error:", sessionError);
        handleError(sessionError);
      }
    };

    checkInitialSession();

    return () => {
      console.log("Cleaning up auth state change listener");
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleError = (error: any) => {
    console.error("Auth error:", error);
    
    // Analyse détaillée de l'erreur
    let errorMessage = "Une erreur est survenue. Veuillez réessayer.";
    
    try {
      const errorBody = typeof error.message === 'string' 
        ? JSON.parse(error.message)
        : error;
      
      console.log("Parsed error:", errorBody);
      
      const errorCode = errorBody?.code || error.code;
      const errorMsg = errorBody?.message || error.message;

      switch(errorCode) {
        case "invalid_credentials":
          errorMessage = "Email ou mot de passe incorrect.";
          break;
        case "user_not_found":
          errorMessage = "Aucun utilisateur trouvé avec cet email.";
          break;
        case "invalid_grant":
          errorMessage = "Email ou mot de passe incorrect.";
          break;
        case "email_not_confirmed":
          errorMessage = "Veuillez confirmer votre email avant de vous connecter.";
          break;
        default:
          if (errorMsg?.includes("Password should be")) {
            errorMessage = "Le mot de passe doit contenir au moins 6 caractères.";
          } else if (errorMsg?.includes("Email not confirmed")) {
            errorMessage = "Veuillez confirmer votre email avant de vous connecter.";
          }
      }
    } catch (e) {
      console.error("Error parsing error message:", e);
    }

    toast({
      variant: "destructive",
      title: "Erreur",
      description: errorMessage
    });
    
    setError(new Error(errorMessage));
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log(`Attempting to ${mode}...`);
      
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Inscription réussie",
          description: "Veuillez vérifier votre email pour confirmer votre compte."
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
      }
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === "login" ? "Connexion" : "Inscription"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error.message}
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "S'inscrire"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Créer un compte" : "Déjà un compte ?"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useAuthNavigate() {
  const navigate = useNavigate();

  const authNavigate = (path: string) => {
    const user = localStorage.getItem("fitverse_user");
    if (!user) {
      toast("Sign in securely to unlock this feature.", {
        description: "Join FitVerse to start building your Smart Wardrobe.",
        action: {
          label: "Log In",
          onClick: () => navigate("/login")
        }
      });
      sessionStorage.setItem("fitverse_redirect", path);
      navigate("/login");
      return;
    }
    navigate(path);
  };

  return authNavigate;
}

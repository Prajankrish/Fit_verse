import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ProtectedRoute() {
  const location = useLocation();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("fitverse_user");
    if (!user) {
      toast("Authentication Required", {
        description: "You must be logged in to view this page.",
      });
      sessionStorage.setItem("fitverse_redirect", location.pathname);
      setIsAuth(false);
    } else {
      setIsAuth(true);
    }
  }, [location]);

  if (isAuth === null) return null;

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}

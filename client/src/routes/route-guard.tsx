import { useAuth } from "@/hooks/use-auth";
import { Navigate, Outlet } from "react-router-dom";

interface Props {
  requireAuth?: boolean;
}

const RouteGuard = ({ requireAuth }: Props) => {
  const { user } = useAuth();
  if (requireAuth && !user) return <Navigate to="/" replace />;
  // ex: If the user goes to /sign-up while already logged in → redirect to /chat.
  if (!requireAuth && user) return <Navigate to="/chat" replace />;

  return <Outlet />;
};

export default RouteGuard;

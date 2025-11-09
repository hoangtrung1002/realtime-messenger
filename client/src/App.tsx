import { useEffect } from "react";
import { useAuth } from "./hooks/use-auth";
import AppRoutes from "./routes";
import Logo from "./components/logo";
import { Spinner } from "./components/ui/spinner";
import { useLocation } from "react-router-dom";
import { isAuthRoute } from "./routes/routes";

function App() {
  const { pathname } = useLocation();
  const { user, isAuthStatusLoading, isAuthStatus } = useAuth();
  const isAuth = isAuthRoute(pathname);

  useEffect(() => {
    isAuthStatus();
  }, [isAuthStatus]);

  if (isAuthStatusLoading && !user && !isAuth)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Logo imgClass="size-20" showText={false} />
        <Spinner className="w-6 h-6" />
      </div>
    );

  return <AppRoutes />;
}

export default App;

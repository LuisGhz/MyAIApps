import { useEffect } from "react";
import { Outlet } from "react-router";
import { Layout } from "antd";
import { useAppAuth0 } from "@core/hooks/useAppAuth0";
import { AppSider } from "@core/components/AppSider";
import { useAppStore } from "@st/app/app-store";
import { AppHeader } from "@core/components/AppHeader";
import { useApiAuth } from "@/services";

const { Content } = Layout;

type AuthAppProps = {
  children: React.ReactNode;
};

const AuthApp = ({ children }: AuthAppProps) => {
  const { isLoading, isAuthenticated, login, getToken, logout } = useAppAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) login();
    else if (isAuthenticated) {
      getToken().catch(() => {
        logout()
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, login]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
};

function App() {
  const isMobile = useAppStore((state) => state.isMobile);
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed);
  const setIsMobile = useAppStore((state) => state.setIsMobile);
  const collapse = useAppStore((state) => state.collapse);
  const expand = useAppStore((state) => state.expand);
  const { isReady } = useApiAuth();

  const mobileBreakpoint = 991;

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < mobileBreakpoint;
      setIsMobile(isMobile);
      if (isMobile) collapse();
      else expand();
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackdropClick = () => {
    if (isMobile) collapse();
  };

  if (!isReady) return null;

  return (
    <Layout style={{ height: "100vh" }}>
      {isMobile && !isSidebarCollapsed && (
        <div
          className="fixed top-0 left-0 z-50 bg-black/35 w-full h-dvh"
          onClick={handleBackdropClick}
        />
      )}
      <AppSider />
      <Layout
        className="bg-app"
        style={{ marginLeft: isMobile ? 0 : isSidebarCollapsed ? 80 : 250 }}
      >
        <AppHeader />
        <Content className="px-2 mx-auto w-full max-w-5xl overflow-hidden h-full">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default function AppWrapper() {
  return (
    <AuthApp>
      <App />
    </AuthApp>
  );
}

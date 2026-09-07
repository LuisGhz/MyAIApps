import { Layout } from "antd";
import { Link } from "react-router";
import { useAppStore } from "@st/app/app-store";
import { LogoutOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { useAppAuth0 } from "@core/hooks/useAppAuth0";

const { Sider } = Layout;

export const AppSider = () => {
  const isMobile = useAppStore((state) => state.isMobile);
  const isCollapsed = useAppStore((state) => state.isSidebarCollapsed);
  const collapse = useAppStore((state) => state.collapse);
  const { logout } = useAppAuth0();

  const collapseOnMobile = () => {
    if (isMobile && !isCollapsed) collapse();
  };

  return (
    <Sider
      collapsible
      collapsed={isCollapsed}
      trigger={null}
      className={`${isMobile ? "absolute! z-100! h-dvh!" : ""} bg-gray-200! dark:bg-gray-950!`}
      width={250}
      collapsedWidth={0}
    >
      <nav className="flex flex-col h-full">
        <section className="flex justify-end px-3 pt-4 pb-2">
          <button
            className="text-white cursor-pointer wcag-outline-vi bg-blue-500 dark:bg-transparent  
              hocusvi:bg-blue-600 dark:hocusvi:bg-gray-900 rounded p-1.5 transc200"
            type="button"
            onClick={collapse}
          >
            <MenuFoldOutlined className="text-2xl" />
          </button>
        </section>
        <ul className="text-app flex-1">
          <li>
            <Link
              className="text-app hocusvi:bg-blue-500! hocusvi:text-white! dark:hocusvi:bg-gray-900! transc200 block py-2 px-2 wcag-outline"
              to="/generate"
              onClick={collapseOnMobile}
            >
              <span>Generate a new image</span>
            </Link>
          </li>
          <li>
            <Link
              className="text-app hocusvi:bg-blue-500! hocusvi:text-white! dark:hocusvi:bg-gray-900! transc200 block py-2 px-2 wcag-outline"
              to="/generated"
              onClick={collapseOnMobile}
            >
              <span>View saved images</span>
            </Link>
          </li>
        </ul>
        <ul>
          <li className="flex justify-end p-4">
            <button
              className="text-white flex items-center gap-2 cursor-pointer hocus:bg-blue-400 wcag-outline-vi transc200 bg-blue-500 dark:bg-transparent  
              hocusvi:bg-blue-600 dark:hocusvi:bg-gray-900 py-2 px-3 rounded"
              type="button"
              onClick={logout}
            >
              <LogoutOutlined className="text-xl" />
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </Sider>
  );
};

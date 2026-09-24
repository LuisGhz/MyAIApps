import { Layout, Typography } from "antd";
import { MenuUnfoldOutlined } from "@ant-design/icons";
import { useAppStore } from "@st/app/app-store";

const { Header } = Layout;
const { Title } = Typography;

export const AppHeader = () => {
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed);
  const collapse = useAppStore((state) => state.collapse);
  const expand = useAppStore((state) => state.expand);

  const toggleSider = () => {
    if (isSidebarCollapsed) expand();
    else collapse();
  };

  return (
    <Header className="bg-app flex items-center gap-3 h-14! p-4!">
      {isSidebarCollapsed && (
        <button
          className="text-white cursor-pointer wcag-outline bg-blue-500 dark:bg-transparent  
              hocusvi:bg-blue-600 dark:hocusvi:bg-gray-950 rounded p-2 transc200 w-9 h-9 flex items-center justify-center"
          type="button"
          onClick={toggleSider}
        >
          <MenuUnfoldOutlined className="text-xl" />
        </button>
      )}
      <Title className="text-app" level={3} style={{ margin: 0 }}>
        MyAIImg
      </Title>
    </Header>
  );
};

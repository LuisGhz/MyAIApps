import { Typography } from "antd";
import { useAppAuth0 } from "@core/hooks/useAppAuth0";

const { Title, Paragraph } = Typography;

export const HomePage = () => {
  const { user } = useAppAuth0();

  return (
    <>
      <div>
        <Title className="text-app text-center" level={2}>
          Welcome to MyAIImg! 👋
        </Title>
        <Paragraph className="text-app text-center">
          Hello, <strong>{user?.name}</strong>! now you can create stunning AI-generated images with
          ease. Get started by exploring the features and tools we offer to bring your imagination
          to life.
        </Paragraph>
      </div>

      <div>
        <Title level={4}>User Profile</Title>
        <pre
          style={{
            background: "#f5f5f5",
            padding: "16px",
            borderRadius: "8px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </>
  );
};

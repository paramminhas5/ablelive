import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/dj")({
  component: () => <Navigate to="/world/dj" />,
});

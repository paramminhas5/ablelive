import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/beginner")({
  component: () => <Navigate to="/world/fundamentals" />,
});

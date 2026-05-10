import { createFileRoute, Navigate } from "@tanstack/react-router";

// Paths is merged into the Skill Tree — the same page now lets you pick a path
// and see worlds + skill lanes in one view.
export const Route = createFileRoute("/paths")({
  component: () => <Navigate to="/learn" />,
});

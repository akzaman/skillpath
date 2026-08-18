import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/teach")({
  component: TeachLayout,
});

function TeachLayout() {
  return <Outlet />;
}

import type { Metadata } from "next";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard — Cadence",
  description:
    "Turn any script into lifelike speech: type a line, generate, then play and download the render.",
};

export default function DashboardPage() {
  return <DashboardView />;
}

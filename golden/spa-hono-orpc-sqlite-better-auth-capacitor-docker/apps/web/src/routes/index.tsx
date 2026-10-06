import { createFileRoute } from "@tanstack/react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@my-app/ui/components/card";

import { ApiStatus } from "#src/components/api-status.tsx";
import { CounterCard } from "#src/components/counter-card.tsx";

const HomePage = () => (
  <Card>
    <CardHeader>
      <CardTitle>my-app</CardTitle>
      <CardDescription>
        React, Hono, oRPC, SQLite, Drizzle and Better Auth on Vite+.
      </CardDescription>
    </CardHeader>
    <CardContent className="flex items-center justify-between">
      <span>Client count</span>
      <CounterCard />
    </CardContent>
    <CardContent className="flex items-center justify-between">
      <span>API status</span>
      <ApiStatus />
    </CardContent>
  </Card>
);

export const Route = createFileRoute("/")({
  component: HomePage,
});

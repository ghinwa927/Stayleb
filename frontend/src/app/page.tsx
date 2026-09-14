"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";

export default function Home() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    async function checkBackend() {
      try {
        const data = await apiFetch("/db-test");
setStatus(data.database);
      } catch (error) {
        setStatus("Backend connection failed");
      }
    }

    checkBackend();
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">StayLeb</h1>

      <p className="mt-4">
        Backend status: {status}
      </p>
    </main>
  );
}
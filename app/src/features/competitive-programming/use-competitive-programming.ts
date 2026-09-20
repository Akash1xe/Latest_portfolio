import { useEffect, useState } from "react";

import { competitiveProgrammingFallback } from "./fallback";
import type { CompetitiveProgrammingData } from "./types";

export const useCompetitiveProgramming = () => {
  const [data, setData] = useState<CompetitiveProgrammingData>(
    competitiveProgrammingFallback
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/competitive-programming", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Stats service is unavailable");
        return response.json() as Promise<CompetitiveProgrammingData>;
      })
      .then(setData)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setData(competitiveProgrammingFallback);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  return { data, isLoading };
};


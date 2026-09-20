/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { experiences as fallbackExperiences } from "@/components/home/portfolio/work/experienceDump";

import { defaultPortfolioContent } from "./defaults";
import type { PortfolioContent } from "./types";

type ContentContextValue = { content: PortfolioContent; loading: boolean };

const ContentContext = createContext<ContentContextValue>({
  content: { ...defaultPortfolioContent, experiences: fallbackExperiences },
  loading: true,
});

export const PortfolioContentProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const fallback = useMemo(
    () => ({ ...defaultPortfolioContent, experiences: fallbackExperiences }),
    []
  );
  const [content, setContent] = useState<PortfolioContent>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/content")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("content unavailable"))))
      .then((payload: { content?: PortfolioContent }) => {
        if (!payload.content) return;
        setContent({
          ...fallback,
          ...payload.content,
          profile: { ...fallback.profile, ...payload.content.profile },
          about: { ...fallback.about, ...payload.content.about },
          competitiveProgramming: {
            ...fallback.competitiveProgramming,
            ...payload.content.competitiveProgramming,
          },
          experiences: payload.content.experiences?.length ? payload.content.experiences : fallback.experiences,
        });
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [fallback]);

  return <ContentContext.Provider value={{ content, loading }}>{children}</ContentContext.Provider>;
};

export const usePortfolioContent = () => useContext(ContentContext);

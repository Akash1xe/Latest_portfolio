import { AlertCircle, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

import styles from "./not-found.module.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ctp-base flex items-center justify-center px-4">
      <div className={`text-center max-w-md ${styles.containerEnter}`}>
        <div className={`mb-6 flex justify-center ${styles.iconPop}`}>
          <div className="relative">
            <AlertCircle className="w-24 h-24 text-ctp-red" />
            <div
              className={`absolute inset-0 bg-ctp-red rounded-full blur-xl ${styles.glowPulse}`}
            />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-ctp-text mb-4">
          Oops!
        </h1>

        <p className="text-lg text-ctp-subtext0 mb-2">
          This page doesn't exist
        </p>

        <p className="text-sm text-ctp-subtext1 mb-8">
          Check the address or return to the portfolio home page.
        </p>

        <button
          onClick={() => navigate("/", { replace: true })}
          className="inline-flex items-center gap-2 bg-ctp-mauve text-ctp-base px-6 py-3 rounded-lg font-medium hover:bg-ctp-mauve/90 transition-colors interactive-scale"
        >
          <Home className="w-5 h-5" />
          Go Home Now
        </button>

        <div className={`mt-8 text-xs text-ctp-subtext1 ${styles.simpleFade}`}>
          Looking for something specific? Try the navigation menu.
        </div>
      </div>
    </div>
  );
};

export default NotFound;

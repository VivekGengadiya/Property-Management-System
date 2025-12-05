import { createContext, useContext, useState } from "react";
import "./ErrorToast.css";

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState("");

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  };

  return (
    <ErrorContext.Provider value={{ error, showError }}>
      {children}

      {/* GLOBAL ERROR BANNER AT TOP */}
      {error && (
        <div className="global-error-banner">
          {error}
        </div>
      )}
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);

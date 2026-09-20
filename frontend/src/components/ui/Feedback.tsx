"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { X, Info } from "lucide-react";
const FeedbackContext = createContext<(message: string) => void>(() => {});
interface FeedbackProviderProps {
  readonly children: ReactNode;
}
export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 6500);
    return () => clearTimeout(timer);
  }, [message]);
  return (
    <FeedbackContext.Provider value={setMessage}>
      {children}
      {message && (
        <div className="toast" role="status">
          <Info size={20} />
          <span>{message}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setMessage("")}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}
export function useFeedback() {
  return useContext(FeedbackContext);
}
interface LocalActionProps {
  readonly children: ReactNode;
  readonly message?: string;
  readonly className?: string;
}
export function LocalAction({
  children,
  message = "This service is not available in this preview.",
  className,
}: LocalActionProps) {
  const notify = useFeedback();
  return (
    <button type="button" className={className} onClick={() => notify(message)}>
      {children}
    </button>
  );
}

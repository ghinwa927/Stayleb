'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, X } from 'lucide-react';
const Context = createContext<{ notify: (message: string) => void }>({ notify: () => {} });
export const useFeedback = () => useContext(Context);
export function AppProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  return <Context.Provider value={{ notify: setMessage }}>{children}{message && <div role="status" className="toast"><CheckCircle2 size={20}/><span>{message}</span><button onClick={() => setMessage('')} aria-label="Dismiss notification"><X size={18}/></button></div>}</Context.Provider>;
}

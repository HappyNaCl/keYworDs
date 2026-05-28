import { createContext } from "react";

export type UserContextValue = {
  name: string;
  setName: (name: string) => void;
};

export const UserContext = createContext<UserContextValue | null>(null);

import { useMemo, useState, type ReactNode } from "react";
import { UserContext, type UserContextValue } from "./UserContext";

type UserProviderProps = {
  children: ReactNode;
};

function UserProvider({ children }: UserProviderProps) {
  const [name, setName] = useState("");

  const value = useMemo<UserContextValue>(
    () => ({ name, setName }),
    [name],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export default UserProvider;

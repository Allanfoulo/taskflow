import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: "admin" | "manager" | "member";
};

interface AuthContextType {
  user: User | null;
  session: null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const convexUser = useQuery(api.users.current);
  const ensureCurrentProfile = useMutation(api.profiles.ensureCurrentProfile);
  const [userOverride, setUserOverride] = useState<User | null>(null);

  useEffect(() => {
    if (isAuthenticated && convexUser) {
      void ensureCurrentProfile({});
    }
  }, [convexUser, ensureCurrentProfile, isAuthenticated]);

  useEffect(() => {
    if (convexUser) {
      setUserOverride(convexUser);
    } else if (!isAuthenticated) {
      setUserOverride(null);
    }
  }, [convexUser, isAuthenticated]);

  const login = async (email: string, password: string) => {
    await signIn("password", {
      flow: "signIn",
      email,
      password,
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    await signIn("password", {
      flow: "signUp",
      name,
      email,
      password,
    });
  };

  const logout = async () => {
    await signOut();
    setUserOverride(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUserOverride((currentUser) => {
      if (currentUser === null) {
        return null;
      }
      return { ...currentUser, ...updates };
    });
  };

  const user = userOverride;
  const loading = authLoading || (isAuthenticated && convexUser === undefined);

  return (
    <AuthContext.Provider
      value={{
        user,
        session: null,
        isAuthenticated,
        isLoading: loading,
        login,
        signup,
        register: signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

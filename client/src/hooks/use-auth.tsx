import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, LoginData, RegisterData } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<any, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<any, Error, RegisterData>;
  verifyEmailMutation: UseMutationResult<any, Error, { userId: number; code: string }>;
  verify2FAMutation: UseMutationResult<any, Error, { userId: number; code: string }>;
  enable2FAMutation: UseMutationResult<any, Error, void>;
  verify2FASetupMutation: UseMutationResult<any, Error, { code: string }>;
  disable2FAMutation: UseMutationResult<any, Error, void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (data: any) => {
      if (data.requiresTwoFactor) {
        toast({
          title: "2-Step Verification Required",
          description: "A verification code has been sent to your email",
        });
      } else if (data.user) {
        queryClient.setQueryData(["/api/user"], data.user);
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (data: any) => {
      if (data.requiresEmailVerification) {
        toast({
          title: "Registration Successful",
          description: "Please verify your email address",
        });
      } else {
        queryClient.setQueryData(["/api/user"], data.user);
        toast({
          title: "Registration Successful",
          description: "Welcome to Bottle9jaBet!",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async ({ userId, code }: { userId: number; code: string }) => {
      const res = await apiRequest("POST", "/api/verify-email", { userId, code });
      return await res.json();
    },
    onSuccess: (data: any) => {
      if (data.user) {
        queryClient.setQueryData(["/api/user"], data.user);
      }
      toast({
        title: "Email Verified",
        description: "Your email has been verified successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: async ({ userId, code }: { userId: number; code: string }) => {
      const res = await apiRequest("POST", "/api/verify-2fa", { userId, code });
      return await res.json();
    },
    onSuccess: (data: any) => {
      if (data.user) {
        queryClient.setQueryData(["/api/user"], data.user);
      }
      toast({
        title: "Verification Successful",
        description: "You have been logged in successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const enable2FAMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/enable-2fa");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "2-Step Verification Setup",
        description: "A verification code has been sent to your email",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verify2FASetupMutation = useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      const res = await apiRequest("POST", "/api/verify-2fa-setup", { code });
      return await res.json();
    },
    onSuccess: (data: any) => {
      if (data.user) {
        queryClient.setQueryData(["/api/user"], data.user);
      }
      toast({
        title: "2-Step Verification Enabled",
        description: "Your account is now more secure",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/disable-2fa");
      return await res.json();
    },
    onSuccess: (data: any) => {
      if (data.user) {
        queryClient.setQueryData(["/api/user"], data.user);
      }
      toast({
        title: "2-Step Verification Disabled",
        description: "2-Step verification has been turned off",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Disable Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logout Successful",
        description: "You have been logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        verifyEmailMutation,
        verify2FAMutation,
        enable2FAMutation,
        verify2FASetupMutation,
        disable2FAMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

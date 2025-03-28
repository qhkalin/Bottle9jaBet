import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { RegisterData, LoginData } from "@shared/schema";
import { registerSchema, loginSchema } from "@shared/schema";
import OtpInput from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AuthForm() {
  const [activeTab, setActiveTab] = useState("login");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [twoFAUserId, setTwoFAUserId] = useState<number | null>(null);
  const [twoFACode, setTwoFACode] = useState("");

  const { 
    loginMutation, 
    registerMutation,
    verifyEmailMutation,
    verify2FAMutation
  } = useAuth();
  
  // Register form
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      password: "",
      confirmPassword: ""
    }
  });
  
  // Login form
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onRegisterSubmit = async (data: RegisterData) => {
    try {
      const response = await registerMutation.mutateAsync(data);
      if (response.requiresEmailVerification) {
        setPendingVerification(true);
        setPendingUserId(response.userId);
      }
    } catch (error) {
      // Error handling is in the mutation
    }
  };
  
  const onLoginSubmit = async (data: LoginData) => {
    try {
      const response = await loginMutation.mutateAsync(data);
      if (response.requiresTwoFactor) {
        setNeeds2FA(true);
        setTwoFAUserId(response.userId);
      }
    } catch (error) {
      // Error handling is in the mutation
    }
  };
  
  const handleVerifyEmail = async () => {
    if (!pendingUserId || verificationCode.length !== 6) return;
    
    try {
      await verifyEmailMutation.mutateAsync({
        userId: pendingUserId,
        code: verificationCode
      });
      setPendingVerification(false);
      setPendingUserId(null);
      setVerificationCode("");
    } catch (error) {
      // Error handling is in the mutation
    }
  };
  
  const handleVerify2FA = async () => {
    if (!twoFAUserId || twoFACode.length !== 6) return;
    
    try {
      await verify2FAMutation.mutateAsync({
        userId: twoFAUserId,
        code: twoFACode
      });
      setNeeds2FA(false);
      setTwoFAUserId(null);
      setTwoFACode("");
    } catch (error) {
      // Error handling is in the mutation
    }
  };

  if (pendingVerification) {
    return (
      <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Email Verification</h2>
        <p className="text-muted-foreground mb-6 text-center">
          We've sent a verification code to your email. Please enter it below.
        </p>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Verification Code</Label>
            <OtpInput 
              length={6} 
              onChange={setVerificationCode} 
              value={verificationCode}
              autoFocus
            />
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleVerifyEmail}
            disabled={verificationCode.length !== 6 || verifyEmailMutation.isPending}
          >
            {verifyEmailMutation.isPending ? "Verifying..." : "Verify Email"}
          </Button>
        </div>
      </div>
    );
  }
  
  if (needs2FA) {
    return (
      <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">2-Step Verification</h2>
        <p className="text-muted-foreground mb-6 text-center">
          We've sent a verification code to your email. Please enter it below.
        </p>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Verification Code</Label>
            <OtpInput 
              length={6} 
              onChange={setTwoFACode} 
              value={twoFACode}
              autoFocus
            />
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleVerify2FA}
            disabled={twoFACode.length !== 6 || verify2FAMutation.isPending}
          >
            {verify2FAMutation.isPending ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-6">
      <Tabs
        defaultValue="login"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="flex mb-6 rounded overflow-hidden w-full">
          <TabsTrigger 
            value="login" 
            className="flex-1 py-2 px-4 font-accent"
          >
            Login
          </TabsTrigger>
          <TabsTrigger 
            value="register" 
            className="flex-1 py-2 px-4 font-accent"
          >
            Register
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="login" className="space-y-4">
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email Address</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="your@email.com"
                {...loginForm.register("email")}
              />
              {loginForm.formState.errors.email && (
                <p className="text-destructive text-sm">{loginForm.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="********"
                {...loginForm.register("password")}
              />
              {loginForm.formState.errors.password && (
                <p className="text-destructive text-sm">{loginForm.formState.errors.password.message}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <Checkbox id="remember-me" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="text-secondary hover:text-secondary/80">
                  Forgot your password?
                </a>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="register" className="space-y-4">
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-name">Full Name</Label>
              <Input
                id="register-name"
                type="text"
                placeholder="John Doe"
                {...registerForm.register("fullName")}
              />
              {registerForm.formState.errors.fullName && (
                <p className="text-destructive text-sm">{registerForm.formState.errors.fullName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="register-username">Username</Label>
              <Input
                id="register-username"
                type="text"
                placeholder="johndoe"
                {...registerForm.register("username")}
              />
              {registerForm.formState.errors.username && (
                <p className="text-destructive text-sm">{registerForm.formState.errors.username.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="register-email">Email Address</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="your@email.com"
                {...registerForm.register("email")}
              />
              {registerForm.formState.errors.email && (
                <p className="text-destructive text-sm">{registerForm.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                type="password"
                placeholder="********"
                {...registerForm.register("password")}
              />
              {registerForm.formState.errors.password && (
                <p className="text-destructive text-sm">{registerForm.formState.errors.password.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">Confirm Password</Label>
              <Input
                id="register-confirm-password"
                type="password"
                placeholder="********"
                {...registerForm.register("confirmPassword")}
              />
              {registerForm.formState.errors.confirmPassword && (
                <p className="text-destructive text-sm">{registerForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            
            <div className="flex items-center">
              <Checkbox id="terms" required />
              <label htmlFor="terms" className="ml-2 block text-sm text-muted-foreground">
                I agree to the <a href="#" className="text-secondary hover:text-secondary/80">Terms of Service</a>
              </label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AuthForm;

// src/features/Auth/index.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { auth } from "@/shared/services/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { motion, AnimatePresence } from "framer-motion";

import EmailPasswordForm from "./components/EmailPasswordForm";
import ErrorAlert from "./components/ErrorAlert";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleAuthError = (err: unknown) => {
    if (err instanceof FirebaseError) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("This email is already in use. Please sign in.");
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;
        default:
          setError("An unexpected error occurred. Please try again.");
          break;
      }
    } else {
      setError("An unexpected error occurred.");
    }
  };

  const handleEmailSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, values.email, values.password);
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
      }
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full rounded-xl shadow-lg border border-border bg-card text-card-foreground">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {mode === "signin" ? "Sign In" : "Create an Account"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ErrorAlert message={error} />
                </motion.div>
              )}
            </AnimatePresence>

            <EmailPasswordForm
              form={form}
              onSubmit={handleEmailSubmit}
              isLoading={isLoading}
              mode={mode}
            />
          </CardContent>

          <CardFooter className="flex justify-center text-sm">
            <p className="text-muted-foreground">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <Button
                variant="link"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  form.reset();
                  setError(null);
                }}
                className="p-0 font-semibold text-primary"
              >
                {mode === "signin" ? "Sign Up" : "Sign In"}
              </Button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock } from "lucide-react";

type PasswordInputProps = {
  field: any;
};

export default function PasswordInput({ field }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormItem>
      <FormLabel>Password</FormLabel>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <FormControl>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...field}
            // Add autocomplete attribute to give browsers a hint
            autoComplete="current-password"
            className="bg-input text-foreground border-border pl-10 pr-10"
          />
        </FormControl>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-full px-3 py-1 text-muted-foreground hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <FormMessage />
    </FormItem>
  );
}
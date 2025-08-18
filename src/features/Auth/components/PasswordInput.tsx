import { useState } from "react";
import { Input } from "../../../components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { Button } from "../../../components/ui/button";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
  field: any;
};

export default function PasswordInput({ field }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormItem>
      <FormLabel>Password</FormLabel>
      <div className="relative">
        <FormControl>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...field}
            className="bg-input text-foreground border-border pr-10"
          />
        </FormControl>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-1 text-muted-foreground hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      <FormMessage />
    </FormItem>
  );
}

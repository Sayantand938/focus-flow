import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui//button";
import PasswordInput from "./PasswordInput";

type FormValues = {
  email: string;
  password: string;
};

type EmailPasswordFormProps = {
  form: ReturnType<typeof useForm<FormValues>>;
  onSubmit: (values: FormValues) => void;
  isLoading: boolean;
  mode: "signin" | "signup";
};

export default function EmailPasswordForm({ form, onSubmit, isLoading, mode }: EmailPasswordFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  {...field}
                  className="bg-input text-foreground border-border w-full p-2 rounded-md"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => <PasswordInput field={field} />}
        />

        <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={isLoading}>
          {isLoading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
}

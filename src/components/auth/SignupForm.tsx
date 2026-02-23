"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { signupSchema } from "@/lib/validators";

type SignupFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  timezone: string;
};

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [detectedTimezone, setDetectedTimezone] = useState("UTC");
  const [showTimezoneInput, setShowTimezoneInput] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(signupSchema) as any,
    defaultValues: { timezone: "UTC" },
  });

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDetectedTimezone(tz);
    setValue("timezone", tz);
  }, [setValue]);

  const timezone = watch("timezone");

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        setServerError(body.error ?? "Something went wrong");
        return;
      }

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: "/dashboard",
      });
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-card p-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Create Account</h1>
        <p className="text-text-secondary text-sm">
          Join Candidly Calendar and schedule across timezones effortlessly.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              First Name
            </label>
            <input
              {...register("firstName")}
              type="text"
              placeholder="Jane"
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-danger">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Last Name
            </label>
            <input
              {...register("lastName")}
              type="text"
              placeholder="Doe"
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-danger">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="jane@example.com"
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            placeholder="At least 8 characters"
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Confirm Password
          </label>
          <input
            {...register("confirmPassword")}
            type="password"
            placeholder="Repeat your password"
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Timezone
          </label>
          {!showTimezoneInput ? (
            <div className="flex items-center justify-between px-3 py-2 bg-surface border border-border rounded-lg">
              <span className="text-text-primary text-sm">{timezone || detectedTimezone}</span>
              <button
                type="button"
                onClick={() => setShowTimezoneInput(true)}
                className="text-primary text-xs hover:text-primary-light transition-colors"
              >
                Change
              </button>
            </div>
          ) : (
            <input
              {...register("timezone")}
              type="text"
              placeholder="e.g. America/New_York"
              defaultValue={detectedTimezone}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          )}
          {errors.timezone && (
            <p className="mt-1 text-xs text-danger">{errors.timezone.message}</p>
          )}
        </div>

        {serverError && (
          <div className="px-4 py-3 bg-danger/10 border border-danger/30 rounded-lg">
            <p className="text-danger text-sm">{serverError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 gradient-bg text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:text-primary-light transition-colors">
          Log in
        </Link>
      </p>
    </motion.div>
  );
}

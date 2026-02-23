import { z } from "zod";

export const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    timezone: z.string().default("UTC"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createMeetingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  location: z.string().max(500).optional(),
  duration: z.number().min(15).max(480),
  type: z.enum(["FIXED", "POLL"]),
  proposedTime: z.string().datetime().optional(),
  dateRangeStart: z.string().datetime().optional(),
  dateRangeEnd: z.string().datetime().optional(),
  timeSlots: z
    .array(
      z.object({
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
      })
    )
    .optional(),
  invitees: z.array(
    z.object({
      email: z.string().email(),
      name: z.string().optional(),
    })
  ),
});

export const guestJoinSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email().optional().or(z.literal("")),
});

export const submitAvailabilitySchema = z.object({
  timezone: z.string(),
  availabilities: z.array(
    z.object({
      startTime: z.string().datetime(),
      endTime: z.string().datetime(),
      isAvailable: z.boolean(),
    })
  ),
});

export const fixedResponseSchema = z.object({
  available: z.boolean(),
  timezone: z.string(),
  message: z.string().max(500).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type GuestJoinInput = z.infer<typeof guestJoinSchema>;
export type SubmitAvailabilityInput = z.infer<typeof submitAvailabilitySchema>;
export type FixedResponseInput = z.infer<typeof fixedResponseSchema>;

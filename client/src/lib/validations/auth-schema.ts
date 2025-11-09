import z from "zod";

export const registerSchemaForm = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export const loginSchemaForm = z.object({
  email: z.email("Invalid email").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type registerSchemaType = z.infer<typeof registerSchemaForm>;
export type loginSchemaType = z.infer<typeof loginSchemaForm>;

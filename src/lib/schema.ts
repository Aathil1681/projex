import { z } from "zod";

export const userRegisterSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type UserRegisterType = z.infer<typeof userRegisterSchema>;

export const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type UserLoginType = z.infer<typeof userLoginSchema>;

export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export type UserUpdateType = z.infer<typeof userUpdateSchema>;

export const projectCreateSchema = z.object({
  title: z.string().min(3, "Project title is too short"),
  description: z.string().optional(),
});

export type ProjectCreateType = z.infer<typeof projectCreateSchema>;

export const projectUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
});

export type ProjectUpdateType = z.infer<typeof projectUpdateSchema>;

export const taskCreateSchema = z.object({
  title: z.string().min(3, "Task title is too short"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  projectId: z.string(),
  assigneeId: z.string().optional(),
});

export type TaskCreateType = z.infer<typeof taskCreateSchema>;

export const taskUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  assigneeId: z.string().optional(),
});

export type TaskUpdateType = z.infer<typeof taskUpdateSchema>;

export const authResponseSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  token: z.string(),
});

export type AuthResponseType = z.infer<typeof authResponseSchema>;

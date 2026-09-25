import { z } from "zod";

const registerUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long"),

  email: z
    .string()
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),

  // Public self-registration can only ever create USER or MANAGER accounts -
  // ADMIN must never be reachable here, or anyone could POST role:"ADMIN"
  // directly (bypassing the frontend's own dropdown) and self-provision an
  // admin account.
  role: z
    .enum(["USER", "MANAGER"], { message: "Role must be USER or MANAGER" })
    .default("USER"),

});

const loginUserSchema = z.object({

  email: z
    .string()
    .email("Please provide a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),

});
const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(6, "Please enter a currentPassword"),
  newPassword: z
    .string()
    .min(6, "please enter your new password"),
});




export const authSchemas = { registerUserSchema, loginUserSchema, changePasswordSchema };

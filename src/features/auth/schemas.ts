import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1, "This field is Required."),
});

export const RegisterSchema = z.object({
    name: z.string().trim().min(1, "Your Name is Required."),
    email: z.string().trim().email(),
    password: z.string().min(8, "Password is too short. Minimum 8 Characters are Required."),
});
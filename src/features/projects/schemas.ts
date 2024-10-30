import { z } from "zod";

export const CreateProjectSchema = z.object({
    name: z.string().trim().min(1, "Required"),
    image: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value),
    ])
    .optional(),
    workspaceId: z.string()
});

export const UpdateProjectSchema = z.object({
    name: z.string().trim().min(1, "Minimum 1 character is required.").optional(),
    image: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value),
    ])
    .optional()
});
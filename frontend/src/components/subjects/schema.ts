import { z } from "zod";

export const subjectFormSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
  teacher: z.array(z.string()).optional(),
  isActive: z.boolean(),
});

export type SubjectFormValues = z.infer<typeof subjectFormSchema>;

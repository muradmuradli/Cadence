import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.email("Please enter a valid email"),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

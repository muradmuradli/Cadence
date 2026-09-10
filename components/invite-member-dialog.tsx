"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import {
  InviteMemberFormValues,
  inviteMemberSchema,
} from "@/lib/validations/invite-member";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function InviteMemberDialog({
  open,
  onOpenChange,
  organizationId,
  organizationName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationName: string;
}) {
  const trpc = useTRPC();

  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "" },
  });

  const inviteMember = useMutation(
    trpc.organizations.inviteMember.mutationOptions({
      onSuccess: (_data, variables) => {
        toast.success(`Invite sent to ${variables.email}`);
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't send invite. Try again.");
      },
    }),
  );

  const onSubmit = form.handleSubmit((data) => {
    inviteMember.mutate({ organizationId, email: data.email });
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to {organizationName}</DialogTitle>
          <DialogDescription>
            They&apos;ll need an existing Cadence account - invite them by the
            email they signed up with.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Email
            </span>
            <input
              autoFocus
              type="email"
              placeholder="teammate@studio.com"
              {...form.register("email")}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none transition-colors focus:border-acid"
            />
            {form.formState.errors.email && (
              <p className="mt-1.5 text-xs text-magenta">
                {form.formState.errors.email.message}
              </p>
            )}
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMember.isPending}>
              {inviteMember.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Send invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

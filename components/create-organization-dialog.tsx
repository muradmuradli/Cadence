"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import {
  CreateOrganizationFormValues,
  createOrganizationSchema,
} from "@/lib/validations/organization";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CreateOrganizationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "" },
  });

  const createOrganization = useMutation(
    trpc.organizations.create.mutationOptions({
      onSuccess: (organization) => {
        toast.success(`${organization.name} created`);
        form.reset();
        onOpenChange(false);
        queryClient.invalidateQueries();
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't create organization. Try again.");
      },
    }),
  );

  const onSubmit = form.handleSubmit((data) => {
    createOrganization.mutate({ name: data.name });
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
          <DialogTitle>Create organization</DialogTitle>
          <DialogDescription>
            Give your new workspace a name. You can invite teammates later.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Name
            </span>
            <input
              autoFocus
              placeholder="Acme Inc."
              {...form.register("name")}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none transition-colors focus:border-acid"
            />
            {form.formState.errors.name && (
              <p className="mt-1.5 text-xs text-magenta">
                {form.formState.errors.name.message}
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
            <Button type="submit" disabled={createOrganization.isPending}>
              {createOrganization.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

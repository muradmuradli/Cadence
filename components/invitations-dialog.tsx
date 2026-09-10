"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function InvitationsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: invitations, isPending, isFetching } = useQuery(
    trpc.organizations.getMyInvitations.queryOptions(undefined, {
      enabled: open,
      staleTime: 0,
    }),
  );

  // staleTime: 0 forces a refetch every time the dialog opens (an invite
  // could have arrived since it was last open), so loading covers that
  // refetch too, not just the very first fetch - otherwise a stale cached
  // "no invitations" could flash before the real list swaps in.
  const isLoading = isPending || isFetching;

  const acceptInvitation = useMutation(
    trpc.organizations.acceptInvitation.mutationOptions({
      onSuccess: (_data, variables) => {
        toast.success("Invitation accepted");

        const remaining = (invitations ?? []).filter(
          (invitation) => invitation.id !== variables.invitationId,
        );
        if (remaining.length === 0) {
          onOpenChange(false);
        }

        queryClient.invalidateQueries();
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't accept invitation");
      },
    }),
  );

  const rejectInvitation = useMutation(
    trpc.organizations.rejectInvitation.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't reject invitation");
      },
    }),
  );

  const pendingMutationId =
    acceptInvitation.variables?.invitationId ??
    rejectInvitation.variables?.invitationId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitations</DialogTitle>
          <DialogDescription>
            Organizations that have invited you to join.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !invitations || invitations.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No pending invitations.
          </p>
        ) : (
          <div className="flex min-w-0 flex-col gap-2">
            {invitations.map((invitation) => {
              const isMutating =
                (acceptInvitation.isPending || rejectInvitation.isPending) &&
                pendingMutationId === invitation.id;

              return (
                <div
                  key={invitation.id}
                  className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-surface-2 p-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {invitation.organizationName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {invitation.message}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                    <Button
                      size="sm"
                      disabled={isMutating}
                      className="border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() =>
                        rejectInvitation.mutate({
                          invitationId: invitation.id,
                        })
                      }
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      disabled={isMutating}
                      onClick={() =>
                        acceptInvitation.mutate({
                          invitationId: invitation.id,
                        })
                      }
                    >
                      {isMutating && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                      Accept
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

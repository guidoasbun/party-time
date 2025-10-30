"use client";

/**
 * FR-7: The system shall send email invitations
 * 5.2.3: Email Campain Interface
 * ConfirmSendInvitationsModal Component
 * Confirmation modal displaying guests before sending bulk invitations
 */

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import type { Guest } from "@/types";

interface ConfirmSendInvitationsModalProps {
  open: boolean;
  onClose: () => void;
  guests: Guest[];
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmSendInvitationsModal({
  open,
  onClose,
  guests,
  onConfirm,
  isLoading = false,
}: ConfirmSendInvitationsModalProps) {
  const guestCount = guests.length;
  const alreadyInvitedCount = guests.filter((g) => g.invitation_sent_at).length;
  const newInvitationCount = guestCount - alreadyInvitedCount;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm Send Invitations"
      size="lg"
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Send {guestCount} Invitation{guestCount !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Info Message */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Send Invitation Emails
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                You are about to send invitation emails to{" "}
                <strong>{guestCount}</strong> guest{guestCount !== 1 ? "s" : ""}
                .
                {alreadyInvitedCount > 0 && (
                  <>
                    {" "}
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      {alreadyInvitedCount}
                    </span>{" "}
                    of these guests have already been invited.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Guest List */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
            Recipients ({guestCount})
          </h4>
          <div className="border border-border rounded-lg max-h-[400px] overflow-y-auto">
            <div className="divide-y divide-border">
              {guests.map((guest) => (
                <div
                  key={guest.id}
                  className="p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {guest.first_name} {guest.last_name}
                        </p>
                        {guest.invitation_sent_at && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                            <AlertCircle className="h-3 w-3" />
                            Already Invited
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {guest.email}
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Ready to Send
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                {newInvitationCount > 0
                  ? `This will queue ${newInvitationCount} new invitation email${
                      newInvitationCount !== 1 ? "s" : ""
                    } for immediate delivery.`
                  : "All selected guests have already been invited. This will resend invitation emails."}{" "}
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

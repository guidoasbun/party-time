/**
 * SendInvitationsModal Component
 *
 * FR-7: The system shall send email invitations
 * 5.2.3: Email Campaign Interface
 *
 * Multi-step modal for sending bulk email invitations to guests.
 */

'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { RecipientSelector } from './RecipientSelector';
import { EmailPreviewStep } from './EmailPreviewStep';
import { emailsService } from '@/lib/api/services';
import { Guest, RecipientFilter, BulkInvitationRequest, UUID } from '@/types';

interface SendInvitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: UUID;
  eventName: string;
  guests: Guest[];
  plannerEmail?: string;
}

/**
 * SendInvitationsModal - Multi-step wizard for sending invitations
 */
export function SendInvitationsModal({
  isOpen,
  onClose,
  eventId,
  eventName,
  guests,
  plannerEmail,
}: SendInvitationsModalProps) {
  const queryClient = useQueryClient();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form state
  const [selectedFilter, setSelectedFilter] = useState<RecipientFilter>(
    RecipientFilter.NOT_INVITED
  );
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [excludeAlreadyInvited, setExcludeAlreadyInvited] = useState(true);
  const [subject, setSubject] = useState(`You're Invited! ${eventName}`);

  // Calculate recipients based on filter
  const getRecipients = () => {
    if (selectedFilter === RecipientFilter.CUSTOM) {
      return guests.filter((g) => selectedGuestIds.includes(g.id));
    }

    let filtered = guests;

    // Apply filter logic
    switch (selectedFilter) {
      case RecipientFilter.NOT_INVITED:
        filtered = filtered.filter((g) => !g.invitation_sent_at);
        break;
      case RecipientFilter.PENDING_RSVP:
        filtered = filtered.filter((g) => g.rsvp_status === 'pending');
        break;
      case RecipientFilter.ATTENDING:
        filtered = filtered.filter((g) => g.rsvp_status === 'attending');
        break;
      case RecipientFilter.NOT_ATTENDING:
        filtered = filtered.filter((g) => g.rsvp_status === 'not_attending');
        break;
      case RecipientFilter.MAYBE:
        filtered = filtered.filter((g) => g.rsvp_status === 'maybe');
        break;
    }

    // Apply exclude filter
    if (excludeAlreadyInvited && selectedFilter !== RecipientFilter.NOT_INVITED) {
      filtered = filtered.filter((g) => !g.invitation_sent_at);
    }

    return filtered;
  };

  const recipients = getRecipients();
  const recipientCount = recipients.length;

  // Send invitations mutation
  const sendInvitationsMutation = useMutation({
    mutationFn: async () => {
      const request: BulkInvitationRequest = {
        recipient_filter: selectedFilter,
        guest_ids:
          selectedFilter === RecipientFilter.CUSTOM
            ? selectedGuestIds
            : undefined,
        exclude_already_invited: excludeAlreadyInvited,
        subject_override: subject !== `You're Invited! ${eventName}` ? subject : undefined,
        test_mode: false,
      };

      return emailsService.sendBulkInvitations(eventId, request);
    },
    onSuccess: (data) => {
      alert(
        `Successfully queued ${data.queued} invitation email${data.queued !== 1 ? 's' : ''}!`
      );

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['guests', eventId] });
      queryClient.invalidateQueries({ queryKey: ['invitation-stats', eventId] });

      // Close modal and reset
      handleClose();
    },
    onError: (error: Error) => {
      alert(`Failed to send invitations: ${error.message}`);
    },
  });

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedFilter(RecipientFilter.NOT_INVITED);
    setSelectedGuestIds([]);
    setExcludeAlreadyInvited(true);
    setSubject(`You're Invited! ${eventName}`);
    onClose();
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSend = () => {
    sendInvitationsMutation.mutate();
  };

  const canProceedFromStep1 = recipientCount > 0;
  const canProceedFromStep2 = subject.trim().length > 0;

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Send Invitations"
      size="lg"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentStep === 1 && 'Select Recipients'}
              {currentStep === 2 && 'Customize Email'}
              {currentStep === 3 && 'Review & Send'}
            </span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} />
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Select Recipients */}
          {currentStep === 1 && (
            <RecipientSelector
              guests={guests}
              selectedFilter={selectedFilter}
              selectedGuestIds={selectedGuestIds}
              excludeAlreadyInvited={excludeAlreadyInvited}
              onFilterChange={setSelectedFilter}
              onGuestSelectionChange={setSelectedGuestIds}
              onExcludeChange={setExcludeAlreadyInvited}
            />
          )}

          {/* Step 2: Email Preview */}
          {currentStep === 2 && (
            <EmailPreviewStep
              eventId={eventId}
              guestId={recipients[0]?.id} // Use first recipient for preview
              subject={subject}
              onSubjectChange={setSubject}
              testEmailAddress={plannerEmail}
            />
          )}

          {/* Step 3: Review & Send */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                  Review Campaign
                </h3>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Event:
                    </span>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {eventName}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Subject Line:
                    </span>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {subject}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Recipient Filter:
                    </span>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {selectedFilter.replace('_', ' ').toUpperCase()}
                      {excludeAlreadyInvited &&
                        selectedFilter !== RecipientFilter.NOT_INVITED &&
                        ' (excluding already invited)'}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Total Recipients:
                    </span>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {recipientCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg
                    className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Ready to Send
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      {recipientCount} invitation email{recipientCount !== 1 ? 's' : ''} will be
                      queued for sending. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={sendInvitationsMutation.isPending}
              >
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={sendInvitationsMutation.isPending}
            >
              Cancel
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                variant="default"
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !canProceedFromStep1) ||
                  (currentStep === 2 && !canProceedFromStep2)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                onClick={handleSend}
                disabled={recipientCount === 0 || sendInvitationsMutation.isPending}
              >
                {sendInvitationsMutation.isPending
                  ? 'Sending...'
                  : `Send ${recipientCount} Invitation${recipientCount !== 1 ? 's' : ''}`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

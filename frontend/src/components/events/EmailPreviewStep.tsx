/**
 * EmailPreviewStep Component
 *
 * FR-7: The system shall send email invitations
 * 5.2.3: Email Campaign Interface
 *
 * Preview email template with test send capability.
 */

'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { emailsService } from '@/lib/api/services';
import { UUID } from '@/types';

interface EmailPreviewStepProps {
  eventId: UUID;
  guestId?: UUID;
  subject: string;
  onSubjectChange: (subject: string) => void;
  testEmailAddress?: string;
}

/**
 * EmailPreviewStep - Preview email template and send test email
 */
export function EmailPreviewStep({
  eventId,
  guestId,
  subject,
  onSubjectChange,
  testEmailAddress,
}: EmailPreviewStepProps) {
  const [showTextVersion, setShowTextVersion] = useState(false);

  // Fetch email preview
  const {
    data: preview,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['email-preview', eventId, guestId],
    queryFn: () =>
      emailsService.previewTemplate({
        template_name: 'invitation',
        event_id: eventId,
        guest_id: guestId,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Send test email mutation
  const sendTestMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!preview) {
        throw new Error('Preview not loaded');
      }

      return emailsService.sendTestEmail({
        to_email: email,
        subject: subject || 'Test Invitation',
        html_body: preview.html_content,
        text_body: preview.text_content,
      });
    },
    onSuccess: (data) => {
      alert(`Test email sent successfully to ${data.recipient}`);
    },
    onError: (error: Error) => {
      alert(`Failed to send test email: ${error.message}`);
    },
  });

  const handleSendTest = () => {
    if (!testEmailAddress) {
      alert('Please provide an email address for test send');
      return;
    }
    sendTestMutation.mutate(testEmailAddress);
  };

  return (
    <div className="space-y-4">
      {/* Subject Line Input */}
      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Email Subject <span className="text-red-500">*</span>
        </label>
        <Input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="You're Invited! {Event Name}"
          className="w-full"
          required
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Customize the subject line or leave default
        </p>
      </div>

      {/* Preview Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Email Preview
        </h3>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTextVersion(!showTextVersion)}
          >
            {showTextVersion ? 'Show HTML' : 'Show Plain Text'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh Preview'}
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {error && (
        <ErrorMessage message="Failed to load email preview. Please try again." />
      )}

      {preview && !isLoading && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          {showTextVersion ? (
            /* Plain Text Version */
            <div className="p-6 bg-white dark:bg-gray-800">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900 dark:text-gray-100">
                {preview.text_content || 'No plain text version available'}
              </pre>
            </div>
          ) : (
            /* HTML Version */
            <iframe
              srcDoc={preview.html_content}
              title="Email Preview"
              className="w-full h-[500px] bg-white"
              sandbox="allow-same-origin"
            />
          )}
        </div>
      )}

      {/* Send Test Email */}
      {testEmailAddress && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-600 dark:text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Send Test Email
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                Send a test email to <strong>{testEmailAddress}</strong> to
                verify the email looks correct before sending to all guests.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSendTest}
                disabled={sendTestMutation.isPending || !preview}
              >
                {sendTestMutation.isPending ? 'Sending...' : 'Send Test Email'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Template Info */}
      {preview && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Template: <span className="font-mono">{preview.template_name}</span>{' '}
          • Rendered at {new Date(preview.rendered_at).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

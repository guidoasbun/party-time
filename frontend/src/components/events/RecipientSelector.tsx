/**
 * RecipientSelector Component
 *
 * FR-7: The system shall send email invitations
 * 5.2.3: Email Campaign Interface
 *
 * Allows selection of email recipients through filtering and manual selection.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Guest, RsvpStatus, RecipientFilter } from '@/types';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface RecipientSelectorProps {
  guests: Guest[];
  selectedFilter: RecipientFilter;
  selectedGuestIds: string[];
  excludeAlreadyInvited: boolean;
  onFilterChange: (filter: RecipientFilter) => void;
  onGuestSelectionChange: (guestIds: string[]) => void;
  onExcludeChange: (exclude: boolean) => void;
}

/**
 * RecipientSelector - Allows selecting email recipients with filters
 */
export function RecipientSelector({
  guests,
  selectedFilter,
  selectedGuestIds,
  excludeAlreadyInvited,
  onFilterChange,
  onGuestSelectionChange,
  onExcludeChange,
}: RecipientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options
  const filterOptions = [
    { value: RecipientFilter.ALL, label: 'All Guests' },
    { value: RecipientFilter.NOT_INVITED, label: 'Not Invited' },
    { value: RecipientFilter.PENDING_RSVP, label: 'Pending RSVP' },
    { value: RecipientFilter.ATTENDING, label: 'Attending' },
    { value: RecipientFilter.NOT_ATTENDING, label: 'Not Attending' },
    { value: RecipientFilter.MAYBE, label: 'Maybe Attending' },
    { value: RecipientFilter.CUSTOM, label: 'Custom Selection' },
  ];

  // Apply filter logic to guests
  const filteredGuests = useMemo(() => {
    let result = guests;

    // Apply recipient filter
    switch (selectedFilter) {
      case RecipientFilter.NOT_INVITED:
        result = result.filter((g) => !g.invitation_sent_at);
        break;
      case RecipientFilter.PENDING_RSVP:
        result = result.filter((g) => g.rsvp_status === RsvpStatus.PENDING);
        break;
      case RecipientFilter.ATTENDING:
        result = result.filter((g) => g.rsvp_status === RsvpStatus.ATTENDING);
        break;
      case RecipientFilter.NOT_ATTENDING:
        result = result.filter((g) => g.rsvp_status === RsvpStatus.NOT_ATTENDING);
        break;
      case RecipientFilter.MAYBE:
        result = result.filter((g) => g.rsvp_status === RsvpStatus.MAYBE);
        break;
      case RecipientFilter.CUSTOM:
        // For custom, show all guests for manual selection
        break;
      case RecipientFilter.ALL:
      default:
        // No filter
        break;
    }

    // Apply exclude already invited filter (except for NOT_INVITED filter)
    if (excludeAlreadyInvited && selectedFilter !== RecipientFilter.NOT_INVITED) {
      result = result.filter((g) => !g.invitation_sent_at);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (g) =>
          g.first_name.toLowerCase().includes(term) ||
          g.last_name.toLowerCase().includes(term) ||
          g.email.toLowerCase().includes(term)
      );
    }

    return result;
  }, [guests, selectedFilter, excludeAlreadyInvited, searchTerm]);

  // Calculate selected count based on filter
  const selectedCount = useMemo(() => {
    if (selectedFilter === RecipientFilter.CUSTOM) {
      return selectedGuestIds.length;
    }
    return filteredGuests.length;
  }, [selectedFilter, selectedGuestIds.length, filteredGuests.length]);

  // Handle checkbox toggle
  const handleGuestToggle = (guestId: string) => {
    if (selectedGuestIds.includes(guestId)) {
      onGuestSelectionChange(selectedGuestIds.filter((id) => id !== guestId));
    } else {
      onGuestSelectionChange([...selectedGuestIds, guestId]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    const allIds = filteredGuests.map((g) => g.id);
    onGuestSelectionChange(allIds);
  };

  // Handle deselect all
  const handleDeselectAll = () => {
    onGuestSelectionChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Filter Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Recipients
        </label>
        <Select
          options={filterOptions}
          value={selectedFilter}
          onValueChange={(value) => onFilterChange(value as RecipientFilter)}
          className="w-full"
        />
      </div>

      {/* Exclude Already Invited Checkbox */}
      {selectedFilter !== RecipientFilter.NOT_INVITED && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="excludeInvited"
            checked={excludeAlreadyInvited}
            onChange={(e) => onExcludeChange(e.target.checked)}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label
            htmlFor="excludeInvited"
            className="ml-2 text-sm text-gray-700 dark:text-gray-300"
          >
            Exclude guests who already received an invitation
          </label>
        </div>
      )}

      {/* Recipient Count */}
      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Recipients selected:
        </span>
        <Badge variant="default">
          {selectedCount}
        </Badge>
      </div>

      {/* Custom Selection UI */}
      {selectedFilter === RecipientFilter.CUSTOM && (
        <div className="space-y-3">
          {/* Search */}
          <Input
            type="text"
            placeholder="Search guests by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />

          {/* Select All / Deselect All */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
             
              onClick={handleSelectAll}
              disabled={filteredGuests.length === 0}
            >
              Select All ({filteredGuests.length})
            </Button>
            <Button
              type="button"
              variant="outline"
             
              onClick={handleDeselectAll}
              disabled={selectedGuestIds.length === 0}
            >
              Deselect All
            </Button>
          </div>

          {/* Guest List */}
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-96 overflow-y-auto">
            {filteredGuests.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No guests match your search' : 'No guests available'}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredGuests.map((guest) => (
                  <label
                    key={guest.id}
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGuestIds.includes(guest.id)}
                      onChange={() => handleGuestToggle(guest.id)}
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {guest.first_name} {guest.last_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {guest.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {guest.invitation_sent_at && (
                        <Badge variant="secondary">
                          Invited
                        </Badge>
                      )}
                      <Badge
                        variant={
                          guest.rsvp_status === RsvpStatus.ATTENDING
                            ? 'secondary'
                            : guest.rsvp_status === RsvpStatus.NOT_ATTENDING
                            ? 'destructive'
                            : guest.rsvp_status === RsvpStatus.MAYBE
                            ? 'outline'
                            : 'default'
                        }
                       
                      >
                        {guest.rsvp_status}
                      </Badge>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview of Auto-Selected Guests (Non-Custom Filters) */}
      {selectedFilter !== RecipientFilter.CUSTOM && filteredGuests.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recipients Preview (showing first 5)
          </label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredGuests.slice(0, 5).map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-3"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {guest.first_name} {guest.last_name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {guest.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {guest.invitation_sent_at && (
                      <Badge variant="secondary">
                        Invited
                      </Badge>
                    )}
                    <Badge
                      variant={
                        guest.rsvp_status === RsvpStatus.ATTENDING
                          ? 'secondary'
                          : guest.rsvp_status === RsvpStatus.NOT_ATTENDING
                          ? 'destructive'
                          : guest.rsvp_status === RsvpStatus.MAYBE
                          ? 'outline'
                          : 'default'
                      }
                     
                    >
                      {guest.rsvp_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {filteredGuests.length > 5 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              ... and {filteredGuests.length - 5} more
            </p>
          )}
        </div>
      )}
    </div>
  );
}

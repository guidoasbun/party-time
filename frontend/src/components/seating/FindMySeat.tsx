"use client";

/**
 * FindMySeat Component
 *
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.4: Mobile & Tablet Views
 * Guest search interface with table highlighting
 *
 * Features:
 * - Search for guest by name or email
 * - Display assigned table and seat number
 * - Highlight table on canvas
 * - Responsive design for mobile and desktop
 * - Theme-aware styling
 */

import React, { useState, useMemo, useCallback } from "react";
import { Search, MapPin, User, Mail, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type {
  FindMySeatProps,
  GuestSearchResult,
  UUID,
  TableLayoutWithSeats,
} from "@/types";

/**
 * Find guest's seat assignment in seating chart
 */
const findGuestSeat = (
  guestId: UUID,
  tables: TableLayoutWithSeats[]
): GuestSearchResult | null => {
  for (const table of tables) {
    if (!table.seat_assignments || !Array.isArray(table.seat_assignments))
      continue;

    const assignment = table.seat_assignments.find(
      (a) => a.guest_id === guestId
    );
    if (assignment) {
      return {
        guest_id: guestId,
        guest_name: "", // Will be filled by caller
        table_id: table.id,
        table_number: table.table_number,
        seat_number: assignment.seat_number,
        is_seated: true,
      };
    }
  }

  return null;
};

export default function FindMySeat({
  seatingChart,
  guests,
  onGuestFound,
  onHighlightTable,
  className,
}: FindMySeatProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<GuestSearchResult | null>(
    null
  );
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter guests based on search query
  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return guests
      .filter((guest) => {
        const fullName = `${guest.first_name} ${guest.last_name}`.toLowerCase();
        const email = guest.email.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      })
      .slice(0, 5); // Limit to 5 results
  }, [searchQuery, guests]);

  // Handle guest selection from dropdown
  const handleSelectGuest = useCallback(
    (guestId: UUID) => {
      const guest = guests.find((g) => g.id === guestId);
      if (!guest) return;

      // Find guest's seat assignment
      const tables = seatingChart.tables as TableLayoutWithSeats[];
      const seatInfo = findGuestSeat(guestId, tables);

      const result: GuestSearchResult = seatInfo
        ? {
            ...seatInfo,
            guest_name: `${guest.first_name} ${guest.last_name}`,
          }
        : {
            guest_id: guestId,
            guest_name: `${guest.first_name} ${guest.last_name}`,
            is_seated: false,
          };

      setSelectedGuest(result);
      setShowDropdown(false);
      setSearchQuery("");

      // Notify parent components
      onGuestFound?.(result);
      if (result.is_seated && result.table_id) {
        onHighlightTable?.(result.table_id);
      }
    },
    [guests, seatingChart.tables, onGuestFound, onHighlightTable]
  );

  // Clear selection
  const handleClear = useCallback(() => {
    setSelectedGuest(null);
    setSearchQuery("");
    onHighlightTable?.(null);
  }, [onHighlightTable]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search for your name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            className="pl-9 pr-4 h-11 text-base"
            aria-label="Search for guest"
          />
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && filteredGuests.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            <ul className="max-h-60 overflow-y-auto">
              {filteredGuests.map((guest) => (
                <li key={guest.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectGuest(guest.id)}
                    className="w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {guest.first_name} {guest.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {guest.email}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Selected Guest Result */}
      {selectedGuest && (
        <div className="mt-4 p-4 bg-card border border-border rounded-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-primary flex-shrink-0" />
                <h3 className="text-base font-semibold text-foreground">
                  {selectedGuest.guest_name}
                </h3>
              </div>

              {selectedGuest.is_seated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-sm text-foreground">
                      <span className="font-medium">
                        Table {selectedGuest.table_number}
                      </span>
                      {selectedGuest.seat_number && (
                        <span className="text-muted-foreground">
                          {" "}
                          • Seat {selectedGuest.seat_number}
                        </span>
                      )}
                    </p>
                  </div>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Seat Assigned
                  </Badge>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No seat assignment found. Please contact the event
                    organizer.
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700"
                  >
                    Not Seated
                  </Badge>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="flex-shrink-0"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Additional Info */}
          {selectedGuest.is_seated && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                💡 Your table is highlighted on the seating chart below
              </p>
            </div>
          )}
        </div>
      )}

      {/* No Results Message */}
      {searchQuery.trim() && filteredGuests.length === 0 && showDropdown && (
        <div className="mt-2 p-4 bg-muted/50 border border-border rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            No guests found matching &quot;{searchQuery}&quot;
          </p>
        </div>
      )}
    </div>
  );
}

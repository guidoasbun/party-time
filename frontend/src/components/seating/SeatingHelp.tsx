/**
 * SeatingHelp Component
 *
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.2.5: Seating Chart Polish & Integration
 * Keyboard shortcuts reference panel
 */

"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, X, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { KeyboardShortcut, ShortcutCategory } from "@/types";

interface SeatingHelpProps {
  className?: string;
}

/**
 * Keyboard shortcuts help dialog
 */
export function SeatingHelp({ className }: SeatingHelpProps) {
  const [open, setOpen] = useState(false);

  // Detect OS for keyboard shortcut display
  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  // Define keyboard shortcuts (only implemented shortcuts)
  const shortcuts: KeyboardShortcut[] = [
    // Canvas controls
    {
      key: `${modKey} + Scroll`,
      modifiers: ["ctrl"],
      label: "Zoom",
      description: "Zoom in/out on canvas",
      category: "canvas",
    },
    {
      key: "Space (hold)",
      label: "Pan Mode",
      description: "Hold to enable panning",
      category: "canvas",
    },

    // Table operations
    {
      key: "Delete",
      label: "Delete Table",
      description: "Delete selected table",
      category: "table",
    },

    // Guest operations
    {
      key: "Drag & Drop",
      label: "Assign Guest",
      description: "Drag guest to table to assign seat",
      category: "guest",
    },

    // Navigation
    {
      key: `${modKey} + Z`,
      modifiers: ["ctrl"],
      label: "Undo",
      description: "Undo last action",
      category: "navigation",
    },
    {
      key: `${modKey} + Shift + Z`,
      modifiers: ["ctrl", "shift"],
      label: "Redo",
      description: "Redo last undone action",
      category: "navigation",
    },
    {
      key: `${modKey} + Y`,
      modifiers: ["ctrl"],
      label: "Redo (Alt)",
      description: "Alternative redo shortcut",
      category: "navigation",
    },
    {
      key: `${modKey} + S`,
      modifiers: ["ctrl"],
      label: "Save",
      description: "Manually save changes",
      category: "navigation",
    },
    {
      key: "Escape",
      label: "Deselect",
      description: "Deselect current table",
      category: "navigation",
    },
    {
      key: "?",
      label: "Help",
      description: "Show this help panel",
      category: "general",
    },
  ];

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<ShortcutCategory, KeyboardShortcut[]>);

  // Category labels
  const categoryLabels: Record<ShortcutCategory, string> = {
    canvas: "Canvas Controls",
    table: "Table Operations",
    guest: "Guest Management",
    navigation: "Navigation",
    general: "General",
  };

  // Listen for ? key to open help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        // Only if not in an input field
        const target = e.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          e.preventDefault();
          setOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={cn("w-9 h-9 p-0", className)}
        onClick={() => setOpen(true)}
        aria-label="Show keyboard shortcuts"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Keyboard Shortcuts"
        size="lg"
        className="max-h-[80vh] overflow-y-auto"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Keyboard className="h-5 w-5" />
            <p className="text-sm">
              Quick reference for seating chart keyboard shortcuts
            </p>
          </div>

          <div className="space-y-6 mt-4">
            {Object.entries(groupedShortcuts).map(
              ([category, categoryShortcuts]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    {categoryLabels[category as ShortcutCategory]}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div
                        key={`${category}-${index}`}
                        className="flex items-center justify-between gap-4 rounded-md border border-border bg-card p-3 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {shortcut.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {shortcut.description}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs whitespace-nowrap"
                        >
                          {shortcut.key}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Tip */}
          <div className="rounded-md border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Press{" "}
              <Badge variant="secondary" className="mx-1 font-mono">
                ?
              </Badge>{" "}
              anytime to toggle this help panel.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}

/**
 * Compact help button (icon only)
 */
export function SeatingHelpButton({ className }: { className?: string }) {
  return <SeatingHelp className={className} />;
}

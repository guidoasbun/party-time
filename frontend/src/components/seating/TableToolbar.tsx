/**
 * TableToolbar Component
 *
 * Toolbar for table management operations in seating charts
 * FR-21: Interactive seating chart interface
 * Phase 6.1.4: Table Management Interface
 */

'use client';

import React, { useState } from 'react';
import {
  Plus,
  Grid3x3,
  Trash2,
  Copy,
  LayoutGrid,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TableType, UUID } from '@/types';

// ============================================================================
// Type Definitions
// ============================================================================

export interface TableToolbarProps {
  tableCount: number;
  selectedTableIds: UUID[];
  onAddTable: () => void;
  onAddFromTemplate: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onAutoArrange?: () => void;
  disabled?: boolean;
  className?: string;
}

export interface QuickTableAction {
  type: TableType;
  label: string;
  icon: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

export function TableToolbar({
  tableCount,
  selectedTableIds,
  onAddTable,
  onAddFromTemplate,
  onDeleteSelected,
  onDuplicateSelected,
  onAutoArrange,
  disabled = false,
  className = '',
}: TableToolbarProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const hasSelection = selectedTableIds.length > 0;
  const multipleSelected = selectedTableIds.length > 1;

  // Quick add table actions
  const quickActions: QuickTableAction[] = [
    { type: TableType.ROUND, label: 'Round Table', icon: <div className="w-4 h-4 rounded-full border-2 border-current" /> },
    { type: TableType.RECTANGULAR, label: 'Rectangular', icon: <div className="w-5 h-3 border-2 border-current rounded-sm" /> },
    { type: TableType.SQUARE, label: 'Square Table', icon: <div className="w-4 h-4 border-2 border-current rounded-sm" /> },
    { type: TableType.CUSTOM, label: 'Custom Shape', icon: <div className="w-4 h-4 border-2 border-current rounded" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} /> },
  ];

  return (
    <div
      className={`flex items-center justify-between gap-4 p-4 bg-card border-b border-border ${className}`}
      role="toolbar"
      aria-label="Table management toolbar"
    >
      {/* Left Section - Add Actions */}
      <div className="flex items-center gap-2">
        {/* Add Table Button */}
        <Button
          onClick={onAddTable}
          disabled={disabled}
          variant="default"
         
          className="gap-2"
          aria-label="Add new table"
        >
          <Plus className="w-4 h-4" />
          Add Table
        </Button>

        {/* Quick Add Dropdown */}
        <div className="relative">
          <Button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            disabled={disabled}
            variant="outline"
           
            className="gap-1"
            aria-label="Quick add table"
            aria-expanded={showQuickAdd}
          >
            <Grid3x3 className="w-4 h-4" />
            <ChevronDown className={`w-3 h-3 transition-transform ${showQuickAdd ? 'rotate-180' : ''}`} />
          </Button>

          {showQuickAdd && (
            <div className="absolute left-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
              {quickActions.map((action) => (
                <button
                  key={action.type}
                  onClick={() => {
                    onAddTable();
                    setShowQuickAdd(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg text-left"
                  disabled={disabled}
                >
                  <span className="text-foreground opacity-70">{action.icon}</span>
                  <span className="text-sm text-foreground">{action.label}</span>
                </button>
              ))}
              <div className="border-t border-border">
                <button
                  onClick={() => {
                    onAddFromTemplate();
                    setShowQuickAdd(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors rounded-b-lg text-left"
                  disabled={disabled}
                >
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">Use Template</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Templates Button */}
        <Button
          onClick={onAddFromTemplate}
          disabled={disabled}
          variant="outline"
         
          className="gap-2"
          aria-label="Add tables from template"
        >
          <LayoutGrid className="w-4 h-4" />
          Templates
        </Button>
      </div>

      {/* Center Section - Table Count */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Total Tables:</span>
        <Badge variant="secondary">
          {tableCount}
        </Badge>
        {hasSelection && (
          <>
            <span className="text-muted-foreground mx-2">•</span>
            <span className="text-sm text-muted-foreground">Selected:</span>
            <Badge variant="default">
              {selectedTableIds.length}
            </Badge>
          </>
        )}
      </div>

      {/* Right Section - Bulk Actions */}
      <div className="flex items-center gap-2">
        {hasSelection ? (
          <>
            {/* Duplicate Button */}
            <Button
              onClick={onDuplicateSelected}
              disabled={disabled}
              variant="outline"
             
              className="gap-2"
              aria-label={`Duplicate ${selectedTableIds.length} selected table${multipleSelected ? 's' : ''}`}
            >
              <Copy className="w-4 h-4" />
              {multipleSelected ? 'Duplicate All' : 'Duplicate'}
            </Button>

            {/* Delete Button */}
            <Button
              onClick={onDeleteSelected}
              disabled={disabled}
              variant="outline"
             
              className="gap-2"
              aria-label={`Delete ${selectedTableIds.length} selected table${multipleSelected ? 's' : ''}`}
            >
              <Trash2 className="w-4 h-4" />
              {multipleSelected ? 'Delete All' : 'Delete'}
            </Button>
          </>
        ) : (
          <>
            {/* Bulk Actions Dropdown (when no selection) */}
            {onAutoArrange && (
              <div className="relative">
                <Button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  disabled={disabled || tableCount === 0}
                  variant="outline"
                 
                  className="gap-1"
                  aria-label="Bulk actions menu"
                  aria-expanded={showBulkActions}
                >
                  More Actions
                  <ChevronDown className={`w-3 h-3 transition-transform ${showBulkActions ? 'rotate-180' : ''}`} />
                </Button>

                {showBulkActions && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => {
                        onAutoArrange();
                        setShowBulkActions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors rounded-lg text-left"
                      disabled={disabled || tableCount === 0}
                    >
                      <LayoutGrid className="w-4 h-4 text-foreground" />
                      <span className="text-sm text-foreground">Auto-Arrange Tables</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

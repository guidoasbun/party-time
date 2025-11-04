/**
 * TableProperties Component
 *
 * Properties panel for editing selected table details
 * FR-21: Interactive seating chart interface
 * Phase 6.1.4: Table Management Interface
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Copy,
  Trash2,
  Users,
  Ruler,
  MapPin,
  RotateCw,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { TableType, TableLayout, TableLayoutWithSeats, TableLayoutUpdate } from '@/types';

// ============================================================================
// Type Definitions
// ============================================================================

export interface TablePropertiesProps {
  table: TableLayout | TableLayoutWithSeats | null;
  onClose: () => void;
  onSave: (tableId: string, updates: TableLayoutUpdate) => Promise<void>;
  onDuplicate: (tableId: string) => void;
  onDelete: (tableId: string) => void;
  onClearSeats?: (tableId: string) => void;
  isOpen: boolean;
  isSaving?: boolean;
  className?: string;
}

interface FormData {
  table_number: string;
  table_type: TableType;
  capacity: number;
  width: number;
  height: number;
  rotation: number;
}

// ============================================================================
// Component
// ============================================================================

export function TableProperties({
  table,
  onClose,
  onSave,
  onDuplicate,
  onDelete,
  onClearSeats,
  isOpen,
  isSaving = false,
  className = '',
}: TablePropertiesProps) {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Initialize form data when table changes
  useEffect(() => {
    if (table) {
      setFormData({
        table_number: table.table_number,
        table_type: table.table_type,
        capacity: table.capacity,
        width: table.width,
        height: table.height,
        rotation: table.rotation,
      });
      setIsDirty(false);
      setErrors({});
    }
  }, [table]);

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setFormData(null);
      setIsDirty(false);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen || !table || !formData) {
    return null;
  }

  const assignedCount = 'assigned_count' in table ? table.assigned_count ?? 0 : 0;
  const hasAssignedSeats = assignedCount > 0;

  // Handle field change
  const handleFieldChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
    setIsDirty(true);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.table_number.trim()) {
      newErrors.table_number = 'Table number is required';
    }

    if (formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    if (formData.capacity > 100) {
      newErrors.capacity = 'Capacity cannot exceed 100';
    }

    if (formData.width < 10) {
      newErrors.width = 'Width must be at least 10';
    }

    if (formData.height < 10) {
      newErrors.height = 'Height must be at least 10';
    }

    if (formData.rotation < 0 || formData.rotation > 360) {
      newErrors.rotation = 'Rotation must be between 0 and 360';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const updates: TableLayoutUpdate = {
      table_number: formData.table_number,
      table_type: formData.table_type,
      capacity: formData.capacity,
      width: formData.width,
      height: formData.height,
      rotation: formData.rotation,
    };

    await onSave(table.id, updates);
    setIsDirty(false);
  };

  // Handle reset
  const handleReset = () => {
    if (table) {
      setFormData({
        table_number: table.table_number,
        table_type: table.table_type,
        capacity: table.capacity,
        width: table.width,
        height: table.height,
        rotation: table.rotation,
      });
      setIsDirty(false);
      setErrors({});
    }
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-xl z-40 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } ${className}`}
      role="complementary"
      aria-label="Table properties panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Table Properties</h2>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0"
          aria-label="Close properties panel"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100%-180px)] p-4 space-y-6">
        {/* Table Number */}
        <div>
          <label htmlFor="table-number" className="block text-sm font-medium text-foreground mb-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Table Number
            </div>
          </label>
          <Input
            id="table-number"
            value={formData.table_number}
            onChange={(e) => handleFieldChange('table_number', e.target.value)}
            error={errors.table_number}
            placeholder="e.g., Table 1"
            disabled={isSaving}
          />
        </div>

        {/* Table Type */}
        <div>
          <Select
            label="Table Type"
            options={[
              { value: TableType.ROUND, label: 'Round' },
              { value: TableType.RECTANGULAR, label: 'Rectangular' },
              { value: TableType.SQUARE, label: 'Square' },
              { value: TableType.CUSTOM, label: 'Custom' },
            ]}
            value={formData.table_type}
            onValueChange={(value) => handleFieldChange('table_type', value as TableType)}
            disabled={isSaving}
          />
        </div>

        {/* Capacity */}
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-foreground mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Capacity
            </div>
          </label>
          <Input
            id="capacity"
            type="number"
            min="1"
            max="100"
            value={formData.capacity}
            onChange={(e) => handleFieldChange('capacity', parseInt(e.target.value, 10))}
            error={errors.capacity}
            disabled={isSaving}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">Assigned Seats:</span>
            <Badge variant={hasAssignedSeats ? 'default' : 'secondary'}>
              {assignedCount} / {formData.capacity}
            </Badge>
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Dimensions
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="width" className="block text-xs text-muted-foreground mb-1">
                Width
              </label>
              <Input
                id="width"
                type="number"
                min="10"
                max="500"
                value={formData.width}
                onChange={(e) => handleFieldChange('width', parseInt(e.target.value, 10))}
                error={errors.width}
                disabled={isSaving}
              />
            </div>
            <div>
              <label htmlFor="height" className="block text-xs text-muted-foreground mb-1">
                Height
              </label>
              <Input
                id="height"
                type="number"
                min="10"
                max="500"
                value={formData.height}
                onChange={(e) => handleFieldChange('height', parseInt(e.target.value, 10))}
                error={errors.height}
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        {/* Position (Read-only) */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Position
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">X</label>
              <Input
                value={String(Math.round(table?.x_position ?? 0))}
                disabled
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Y</label>
              <Input
                value={String(Math.round(table?.y_position ?? 0))}
                disabled
                readOnly
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Drag table on canvas to change position</p>
        </div>

        {/* Rotation */}
        <div>
          <label htmlFor="rotation" className="block text-sm font-medium text-foreground mb-2">
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4" />
              Rotation
            </div>
          </label>
          <div className="space-y-2">
            <input
              id="rotation"
              type="range"
              min="0"
              max="360"
              step="5"
              value={formData.rotation}
              onChange={(e) => handleFieldChange('rotation', parseInt(e.target.value, 10))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              disabled={isSaving}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground font-medium">{formData.rotation}°</span>
              <Button
                onClick={() => handleFieldChange('rotation', 0)}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                disabled={isSaving || formData.rotation === 0}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-border space-y-2">
          <h3 className="text-sm font-medium text-foreground mb-3">Quick Actions</h3>

          <Button
            onClick={() => onDuplicate(table.id)}
            variant="outline"
            size="sm"
            className="w-full gap-2"
            disabled={isSaving}
          >
            <Copy className="w-4 h-4" />
            Duplicate Table
          </Button>

          {onClearSeats && hasAssignedSeats && (
            <Button
              onClick={() => onClearSeats(table.id)}
              variant="outline"
              size="sm"
              className="w-full gap-2"
              disabled={isSaving}
            >
              <Users className="w-4 h-4" />
              Clear All Seats ({assignedCount})
            </Button>
          )}

          <Button
            onClick={() => onDelete(table.id)}
            variant="outline"
            size="sm"
            className="w-full gap-2"
            disabled={isSaving}
          >
            <Trash2 className="w-4 h-4" />
            Delete Table
          </Button>
        </div>
      </div>

      {/* Footer - Save/Cancel */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            disabled={!isDirty || isSaving}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            variant="default"
            size="sm"
            className="flex-1 gap-2"
            disabled={!isDirty || isSaving}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

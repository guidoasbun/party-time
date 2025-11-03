/**
 * TableTemplates Component
 *
 * Modal for creating tables from predefined templates
 * FR-21: Interactive seating chart interface
 * Phase 6.1.4: Table Management Interface
 */

'use client';

import React, { useState } from 'react';
import {
  X,
  Circle,
  Square,
  RectangleHorizontal,
  Sparkles,
  Users,
  Grid3x3,
  Check,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { TableType, TableLayoutCreate } from '@/types';

// ============================================================================
// Type Definitions
// ============================================================================

export interface TableTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  tableCount: number;
  totalCapacity: number;
  tables: Omit<TableLayoutCreate, 'seating_chart_id'>[];
}

export interface TableTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (tables: Omit<TableLayoutCreate, 'seating_chart_id'>[]) => Promise<void>;
  canvasWidth: number;
  canvasHeight: number;
  existingTableCount?: number;
  isApplying?: boolean;
}

// ============================================================================
// Template Definitions
// ============================================================================

function generateTemplates(
  canvasWidth: number,
  canvasHeight: number,
  startNumber: number
): TableTemplate[] {
  const padding = 80;
  const spacing = 40;

  return [
    {
      id: 'head-table',
      name: 'Head Table',
      description: 'Single large rectangular table for VIPs or head table',
      icon: <RectangleHorizontal className="w-6 h-6" />,
      tableCount: 1,
      totalCapacity: 16,
      tables: [
        {
          table_number: `Table ${startNumber}`,
          table_type: TableType.RECTANGULAR,
          capacity: 16,
          width: 240,
          height: 80,
          x_position: canvasWidth / 2 - 120,
          y_position: padding,
          rotation: 0,
        },
      ],
    },
    {
      id: 'cocktail-setup',
      name: 'Cocktail Setup',
      description: '10 small round tables for cocktail reception',
      icon: <Circle className="w-6 h-6" />,
      tableCount: 10,
      totalCapacity: 60,
      tables: Array.from({ length: 10 }, (_, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        return {
          table_number: `Table ${startNumber + i}`,
          table_type: TableType.ROUND,
          capacity: 6,
          width: 80,
          height: 80,
          x_position: padding + col * (80 + spacing),
          y_position: padding + row * (80 + spacing),
          rotation: 0,
        };
      }),
    },
    {
      id: 'banquet-style',
      name: 'Banquet Style',
      description: '15 rectangular tables in rows for formal dining',
      icon: <RectangleHorizontal className="w-6 h-6" />,
      tableCount: 15,
      totalCapacity: 120,
      tables: Array.from({ length: 15 }, (_, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        return {
          table_number: `Table ${startNumber + i}`,
          table_type: TableType.RECTANGULAR,
          capacity: 8,
          width: 160,
          height: 80,
          x_position: padding + col * (160 + spacing),
          y_position: padding + row * (80 + spacing),
          rotation: 0,
        };
      }),
    },
    {
      id: 'reception-style',
      name: 'Reception Style',
      description: '20 round tables for wedding reception or large event',
      icon: <Circle className="w-6 h-6" />,
      tableCount: 20,
      totalCapacity: 160,
      tables: Array.from({ length: 20 }, (_, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        return {
          table_number: `Table ${startNumber + i}`,
          table_type: TableType.ROUND,
          capacity: 8,
          width: 120,
          height: 120,
          x_position: padding + col * (120 + spacing),
          y_position: padding + row * (120 + spacing),
          rotation: 0,
        };
      }),
    },
    {
      id: 'mixed-layout',
      name: 'Mixed Layout',
      description: 'Combination of round and rectangular tables',
      icon: <Grid3x3 className="w-6 h-6" />,
      tableCount: 12,
      totalCapacity: 96,
      tables: [
        // Head table
        {
          table_number: `Table ${startNumber}`,
          table_type: TableType.RECTANGULAR,
          capacity: 12,
          width: 200,
          height: 80,
          x_position: canvasWidth / 2 - 100,
          y_position: padding,
          rotation: 0,
        },
        // Round tables
        ...Array.from({ length: 11 }, (_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          return {
            table_number: `Table ${startNumber + i + 1}`,
            table_type: TableType.ROUND,
            capacity: 8,
            width: 100,
            height: 100,
            x_position: padding + col * (100 + spacing),
            y_position: padding + 120 + row * (100 + spacing),
            rotation: 0,
          };
        }),
      ],
    },
  ];
}

// ============================================================================
// Component
// ============================================================================

export function TableTemplates({
  isOpen,
  onClose,
  onApplyTemplate,
  canvasWidth,
  canvasHeight,
  existingTableCount = 0,
  isApplying = false,
}: TableTemplatesProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [startNumber, setStartNumber] = useState<number>(existingTableCount + 1);

  const templates = generateTemplates(canvasWidth, canvasHeight, startNumber);
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const handleApply = async () => {
    if (!selectedTemplate) return;

    await onApplyTemplate(selectedTemplate.tables);
    onClose();
    setSelectedTemplateId(null);
  };

  const handleClose = () => {
    if (!isApplying) {
      onClose();
      setSelectedTemplateId(null);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Table Templates"
      size="lg"
      showCloseButton={!isApplying}
    >
      <div className="space-y-6">
        {/* Description */}
        <p className="text-sm text-muted-foreground">
          Choose a template to quickly add multiple tables to your seating chart.
          Tables will be automatically numbered and positioned.
        </p>

        {/* Start Number Input */}
        <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
          <div className="flex-1">
            <label htmlFor="start-number" className="block text-sm font-medium text-foreground mb-2">
              Start Table Numbering From:
            </label>
            <Input
              id="start-number"
              type="number"
              min="1"
              max="1000"
              value={startNumber}
              onChange={(e) => setStartNumber(parseInt(e.target.value, 10) || 1)}
              disabled={isApplying}
              className="w-32"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Current tables: <Badge variant="secondary">{existingTableCount}</Badge>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => {
            const isSelected = selectedTemplateId === template.id;

            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                disabled={isApplying}
                className={`relative p-5 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                } ${isApplying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Icon */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-secondary'}`}>
                    <div className={isSelected ? 'text-primary' : 'text-foreground'}>
                      {template.icon}
                    </div>
                  </div>

                  <div className="flex-1">
                    {/* Title */}
                    <h3 className="font-semibold text-foreground mb-1">
                      {template.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Grid3x3 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-foreground font-medium">{template.tableCount}</span>
                        <span className="text-muted-foreground">tables</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-foreground font-medium">{template.totalCapacity}</span>
                        <span className="text-muted-foreground">capacity</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Template Details */}
        {selectedTemplate && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h4 className="font-medium text-foreground">Template Preview</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Tables to create:</span>
                <span className="ml-2 font-medium text-foreground">
                  {selectedTemplate.tableCount}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total capacity:</span>
                <span className="ml-2 font-medium text-foreground">
                  {selectedTemplate.totalCapacity} seats
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Table numbers:</span>
                <span className="ml-2 font-medium text-foreground">
                  Table {startNumber} - Table {startNumber + selectedTemplate.tableCount - 1}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Layout:</span>
                <span className="ml-2 font-medium text-foreground">Auto-positioned grid</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            onClick={handleClose}
            variant="outline"
            size="md"
            disabled={isApplying}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            variant="default"
            size="md"
            disabled={!selectedTemplate || isApplying}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isApplying ? 'Creating Tables...' : 'Apply Template'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

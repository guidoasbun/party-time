/**
 * TableManagementDemo Component
 *
 * Client-side demo of complete table management interface
 * FR-21: Interactive seating chart interface
 * Phase 6.1.4: Table Management Interface
 */

'use client';

import React, { useState, useEffect } from 'react';
import SeatingCanvas from '@/components/seating/SeatingCanvas';
import CanvasControls from '@/components/seating/CanvasControls';
import { TableToolbar } from '@/components/seating/TableToolbar';
import { TableProperties } from '@/components/seating/TableProperties';
import { TableTemplates } from '@/components/seating/TableTemplates';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTheme } from '@/contexts/ThemeContext';
import {
  TableType,
  TableLayoutWithSeats,
  TableLayoutCreate,
  TableLayoutUpdate,
  SeatingChart,
  SeatingChartWithTables,
  UUID,
  VenueUnit,
  ZoomState,
} from '@/types';
import { GridConfig } from '@/utils/fabric-shapes';

// ============================================================================
// Component
// ============================================================================

export function TableManagementDemo() {
  const { resolvedTheme } = useTheme();
  const canvasRef = { current: null };

  // State
  const [seatingChart] = useState<SeatingChart>({
    id: 'demo-chart-1' as UUID,
    event_id: 'demo-event-1' as UUID,
    name: 'Demo Seating Chart',
    venue_width: 1200,
    venue_height: 800,
    venue_unit: VenueUnit.FEET,
    version: 1,
    is_active: true,
    chart_metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [tables, setTables] = useState<TableLayoutWithSeats[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<UUID | null>(null);
  const [selectedTableIds, setSelectedTableIds] = useState<UUID[]>([]);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tablesToDelete, setTablesToDelete] = useState<UUID[]>([]);

  // Canvas controls state
  const [zoomState, setZoomState] = useState<ZoomState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [isPanMode, setIsPanMode] = useState(false);
  const [gridConfig, setGridConfig] = useState<GridConfig>({
    enabled: true,
    size: 20,
    color: resolvedTheme === 'dark' ? '#374151' : '#e5e7eb',
    showLines: true,
  });

  // Update grid color when theme changes
  useEffect(() => {
    setGridConfig((prev) => ({
      ...prev,
      color: resolvedTheme === 'dark' ? '#374151' : '#e5e7eb',
    }));
  }, [resolvedTheme]);

  // Create seating chart with tables for display
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
  const totalAssigned = tables.reduce((sum, t) => sum + (t.assigned_count ?? 0), 0);

  const seatingChartWithTables: SeatingChartWithTables = {
    ...seatingChart,
    tables,
    total_tables: tables.length,
    total_capacity: totalCapacity,
    total_assigned: totalAssigned,
  };

  // Generate unique table ID
  const generateTableId = (): UUID => {
    return `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as UUID;
  };

  // Get next table number
  const getNextTableNumber = (): string => {
    const existingNumbers = tables
      .map((t) => {
        const match = t.table_number.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((n) => n > 0);

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    return `Table ${maxNumber + 1}`;
  };

  // Handle table selection
  const handleTableSelect = (tableId: UUID | null) => {
    setSelectedTableId(tableId);
    setSelectedTableIds(tableId ? [tableId] : []);
    setIsPropertiesOpen(!!tableId);
  };

  // Handle add table
  const handleAddTable = () => {
    const newTable: TableLayoutWithSeats = {
      id: generateTableId(),
      seating_chart_id: seatingChart.id,
      table_number: getNextTableNumber(),
      table_type: TableType.ROUND,
      capacity: 8,
      width: 100,
      height: 100,
      x_position: 100 + tables.length * 20,
      y_position: 100 + tables.length * 20,
      rotation: 0,
      seat_assignments: [],
      assigned_count: 0,
      empty_seats: 8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTables((prev) => [...prev, newTable]);
  };

  // Handle table move
  const handleTableMove = (tableId: UUID, x: number, y: number) => {
    console.log('📦 handleTableMove called:', { tableId, x, y });
    setTables((prev) => {
      const updated = prev.map((table) =>
        table.id === tableId
          ? { ...table, x_position: x, y_position: y, updated_at: new Date().toISOString() }
          : table
      );
      console.log('📦 Updated tables state:', updated.find(t => t.id === tableId));
      return updated;
    });
  };

  // Handle table resize
  const handleTableResize = (tableId: UUID, width: number, height: number) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId
          ? { ...table, width, height, updated_at: new Date().toISOString() }
          : table
      )
    );
  };

  // Handle table rotate
  const handleTableRotate = (tableId: UUID, rotation: number) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId ? { ...table, rotation, updated_at: new Date().toISOString() } : table
      )
    );
  };

  // Handle save table properties
  const handleSaveTable = async (tableId: string, updates: TableLayoutUpdate) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId
            ? { ...table, ...updates, updated_at: new Date().toISOString() }
            : table
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle duplicate table
  const handleDuplicateTable = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const newTable: TableLayoutWithSeats = {
      ...table,
      id: generateTableId(),
      table_number: getNextTableNumber(),
      x_position: table.x_position + 20,
      y_position: table.y_position + 20,
      seat_assignments: [],
      assigned_count: 0,
      empty_seats: table.capacity,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTables((prev) => [...prev, newTable]);
  };

  // Handle duplicate selected
  const handleDuplicateSelected = () => {
    selectedTableIds.forEach((id) => handleDuplicateTable(id));
    setSelectedTableIds([]);
    setSelectedTableId(null);
    setIsPropertiesOpen(false);
  };

  // Handle delete table
  const handleDeleteTable = (tableId: string) => {
    setTablesToDelete([tableId as UUID]);
    setDeleteDialogOpen(true);
  };

  // Handle delete selected
  const handleDeleteSelected = () => {
    setTablesToDelete(selectedTableIds);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    setTables((prev) => prev.filter((table) => !tablesToDelete.includes(table.id)));
    setDeleteDialogOpen(false);
    setTablesToDelete([]);
    setSelectedTableIds([]);
    setSelectedTableId(null);
    setIsPropertiesOpen(false);
  };

  // Handle apply template
  const handleApplyTemplate = async (templateTables: Omit<TableLayoutCreate, 'seating_chart_id'>[]) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newTables: TableLayoutWithSeats[] = templateTables.map((t) => ({
        id: generateTableId(),
        seating_chart_id: seatingChart.id,
        ...t,
        seat_assignments: [],
        assigned_count: 0,
        empty_seats: t.capacity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      setTables((prev) => [...prev, ...newTables]);
    } finally {
      setIsSaving(false);
    }
  };

  // Get selected table
  const selectedTable = selectedTableId ? tables.find((t) => t.id === selectedTableId) ?? null : null;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Table Management Demo</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Interactive seating chart with table CRUD operations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Canvas: {seatingChart.venue_width} × {seatingChart.venue_height} {seatingChart.venue_unit}
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <TableToolbar
        tableCount={tables.length}
        selectedTableIds={selectedTableIds}
        onAddTable={handleAddTable}
        onAddFromTemplate={() => setIsTemplatesOpen(true)}
        onDeleteSelected={handleDeleteSelected}
        onDuplicateSelected={handleDuplicateSelected}
      />

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-8 overflow-hidden">
        {/* Left: Canvas Controls */}
        <div className="flex-shrink-0">
          <CanvasControls
            canvasRef={canvasRef}
            zoomState={zoomState}
            onZoomChange={setZoomState}
            isPanMode={isPanMode}
            onPanModeToggle={() => setIsPanMode(!isPanMode)}
            gridConfig={gridConfig}
            onGridToggle={() =>
              setGridConfig((prev) => ({ ...prev, showLines: !prev.showLines }))
            }
          />
        </div>

        {/* Right: Canvas */}
        <div className="flex-1 flex items-center justify-center">
          <SeatingCanvas
            seatingChart={seatingChartWithTables}
            tables={tables}
            onTableSelect={handleTableSelect}
            onTableMove={handleTableMove}
            onTableResize={handleTableResize}
            onTableRotate={handleTableRotate}
            readOnly={false}
            gridConfig={gridConfig}
            zoomState={zoomState}
            onZoomChange={setZoomState}
            theme={resolvedTheme}
            className="border border-border rounded-lg shadow-lg w-full h-full max-w-[1200px] max-h-[800px]"
          />
        </div>
      </div>

      {/* Properties Panel - Moved outside main content container */}
      <TableProperties
        table={selectedTable}
        isOpen={isPropertiesOpen}
        onClose={() => {
          setIsPropertiesOpen(false);
          setSelectedTableId(null);
          setSelectedTableIds([]);
        }}
        onSave={handleSaveTable}
        onDuplicate={handleDuplicateTable}
        onDelete={handleDeleteTable}
        isSaving={isSaving}
      />

      {/* Templates Modal */}
      <TableTemplates
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onApplyTemplate={handleApplyTemplate}
        canvasWidth={seatingChart.venue_width}
        canvasHeight={seatingChart.venue_height}
        existingTableCount={tables.length}
        isApplying={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Table(s)"
        description={
          tablesToDelete.length === 1
            ? 'Are you sure you want to delete this table? This action cannot be undone.'
            : `Are you sure you want to delete ${tablesToDelete.length} tables? This action cannot be undone.`
        }
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}

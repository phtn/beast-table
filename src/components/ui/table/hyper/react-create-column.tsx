import { Icon, IconName } from '@/lib/icons'
import { cn } from '@/lib/utils'
import {
  Subscribe,
  type CellContext,
  type ColumnDef,
  type FilterFn,
  type Row,
  type RowData,
  type Table
} from '@octanejs/tanstack-table'
import { type ReactElement, type ReactNode } from 'react'
import { Checkbox } from '../..'
import type { DefaultColumnPinningPosition } from './ColumnPinning'
import type { TableExportValue } from './export-types'
import { features } from './Features'
import { filterFn, globalFilterFn, groupFilter, multiSelectFilterFn } from './filter-fns'
import { RowActions } from './row-actions'
export { filterFn, globalFilterFn, groupFilter, multiSelectFilterFn }

// Column factory configuration interface
export interface BulkEditorOption {
  value: string
  label: string
}

export interface BulkEditorConfig<T> {
  enabled?: boolean
  type?: 'text' | 'number' | 'select'
  options?: BulkEditorOption[] | ((rows: T[]) => BulkEditorOption[])
  placeholder?: string
}

export interface ColumnMeta<T> extends Record<string, unknown> {
  filterOptions?: Array<string | number | boolean>
  /** Maximum faceted options mounted at once. Search still covers all options. */
  filterOptionLimit?: number
  /**
   * Explicitly opts this field into the bulk editor. Keep sensitive or
   * server-managed fields omitted; backend mutations must still allow-list and
   * validate every submitted key.
   */
  bulkEditor?: boolean | BulkEditorConfig<T>
}

export interface ColumnConfig<T extends RowData> {
  id: string
  header: ReactNode
  accessorKey: Extract<keyof T, string>
  /**
   * Cell renderer function that receives CellContext
   *
   * @example
   * ```tsx
   * // Using textCell from cells.tsx
   * cell: textCell('name', 'font-medium')
   *
   * // Using dateCell from cells.tsx
   * cell: dateCell('createdAt', (date) => format(date, 'MMM dd, yyyy'))
   *
   * // Using booleanCell from cells.tsx
   * cell: booleanCell('isActive', { trueLabel: 'Active', falseLabel: 'Inactive' })
   *
   * // Custom cell renderer
   * cell: ({ getValue }) => {
   *   const value = getValue()
   *   return <span className={value > 100 ? 'text-green-600' : 'text-red-600'}>
   *     {value}
   *   </span>
   * }
   * ```
   */
  cell?: (ctx: CellContext<typeof features, T, unknown>) => ReactNode
  size?: number
  filterFn?: FilterFn<typeof features, T>
  enableFiltering?: boolean
  enableGlobalFiltering?: boolean
  enableHiding?: boolean
  /** Pins this column to a logical edge when the table is first created. */
  defaultPinned?: DefaultColumnPinningPosition
  enablePinning?: boolean
  enableSorting?: boolean
  /** Excludes this data column from CSV and PDF exports. */
  enableExporting?: boolean
  /** Plain-text export heading. Falls back to a string header, then the column id. */
  exportHeader?: string
  /** Formats the raw row value for CSV and PDF without rendering the React cell. */
  exportValue?: (row: T) => TableExportValue
  meta?: ColumnMeta<T>
}

export type ActionRenderMode = 'dropdown' | 'buttons' | 'custom'
export type ActionAlign = 'start' | 'center' | 'end'

export interface ActionItem<T> {
  id?: string
  label: string
  icon?: IconName
  shortcut?: string
  section?: string
  variant?: 'default' | 'destructive'
  appearance?: 'button' | 'icon-button'
  className?: string
  hidden?: boolean | ((row: T) => boolean)
  disabled?: boolean | ((row: T) => boolean)
  onClick: (row: T) => void | Promise<void>
}

export interface ActionTriggerConfig<T extends RowData> {
  icon?: IconName
  label?: string
  className?: string
  render?: (ctx: { row: Row<typeof features, T>; loading: boolean; defaultTrigger: ReactElement }) => ReactElement
}

export interface ActionConfig<T extends RowData> {
  mode?: ActionRenderMode
  align?: ActionAlign
  header?: ReactNode
  columnSize?: number
  trigger?: ActionTriggerConfig<T>
  actions?: ActionItem<T>[]
  render?: (ctx: {
    row: Row<typeof features, T>
    actions: ActionItem<T>[]
    defaultDropdown: ReactNode
    defaultButtons: ReactNode
  }) => ReactNode
  // Backward-compatible legacy config
  viewFn?: (row: T) => void
  deleteFn?: (row: T) => void
  customActions?: Array<{
    label: string
    icon?: IconName
    onClick: (row: T) => void | Promise<void>
    variant?: 'default' | 'destructive'
    shortcut?: string
  }>
  onActionError?: (error: unknown, row: T, action: ActionItem<T>) => void
}

// Generic column factory function
export const createColumns = <T extends RowData>(
  columnConfigs: ColumnConfig<T>[],
  actionConfig?: ActionConfig<T>,
  showSelectColumn: boolean = false,
  showPinColumn: boolean = false
): ColumnDef<typeof features, T, unknown>[] => {
  const reservedColumnIds = new Set([
    'select',
    'pin-row',
    'reorder-row',
    'actions',
    '__proto__',
    'constructor',
    'prototype'
  ])
  const configuredColumnIds = new Set<string>()

  for (const config of columnConfigs) {
    if (config.id.trim().length === 0 || reservedColumnIds.has(config.id) || configuredColumnIds.has(config.id)) {
      throw new Error(
        `DataTable column id "${config.id}" is empty, reserved, or duplicated. Column ids must be non-empty and unique.`
      )
    }
    configuredColumnIds.add(config.id)
  }

  const columns: ColumnDef<typeof features, T, unknown>[] = []

  // Avoid mounting a checkbox and animation tree for every row until selection
  // is actually enabled.
  if (showSelectColumn) {
    columns.push({
      id: 'select',
      header: ({ table }) => <SelectAllCheckbox table={table} />,
      cell: ({ row }) => <SelectRowCheckbox row={row} />,
      size: 50,
      enableHiding: false,
      enableSorting: false,
      enableColumnFilter: false,
      enableGlobalFilter: false
    })
  }

  if (showPinColumn) {
    columns.push({
      id: 'pin-row',
      header: ({ table }) => <PinnedRowsHeader table={table} />,
      cell: ({ row }) => <PinRowButton row={row} />,
      size: 42,
      enableHiding: false,
      enableSorting: false,
      enableColumnFilter: false,
      enableGlobalFilter: false
    })
  }

  // Add data columns based on configuration
  columnConfigs.forEach((config) => {
    const column: ColumnDef<typeof features, T, unknown> = {
      id: config.id,
      header: config.header as string,
      accessorFn: (row) => row[config.accessorKey],
      size: config.size ?? 150,
      filterFn: config.filterFn ?? filterFn,
      enableColumnFilter: config.enableFiltering ?? true,
      enableGlobalFilter: config.enableGlobalFiltering,
      enableHiding: config.enableHiding ?? true,
      enablePinning: config.enablePinning,
      enableSorting: config.enableSorting ?? true,
      ...(config.meta && Object.keys(config.meta).length > 0
        ? {
            meta: {
              filterOptions: config.meta.filterOptions,
              filterOptionLimit: config.meta.filterOptionLimit
            }
          }
        : {}),
      ...(config.cell ? { cell: config.cell } : {})
    }

    columns.push(column)
  })

  const hasActions =
    !!actionConfig &&
    !!(
      actionConfig.render ||
      actionConfig.actions?.length ||
      actionConfig.viewFn ||
      actionConfig.deleteFn ||
      actionConfig.customActions?.length
    )

  // Add actions column if action config is provided
  if (hasActions) {
    columns.push({
      id: 'actions',
      header: () =>
        actionConfig?.header ?? (
          <div className='w-full flex justify-center'>
            <Icon name='chevron-down' className='size-4 dark:text-cyan-200/80 text-blue-50' />
          </div>
        ),
      cell: ({ row }) => <RowActions row={row} actionConfig={actionConfig} />,
      size: actionConfig?.columnSize ?? (actionConfig?.mode === 'buttons' ? 160 : 64),
      enableHiding: false,
      enableSorting: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
      enablePinning: true,
      defaultPinned: 'end'
    } as ColumnDef<typeof features, T, unknown>)
  }

  return columns
}

const PinnedRowsHeader = <T extends RowData>({ table }: { table: Table<typeof features, T> }) => (
  <Subscribe source={table.atoms.rowPinning}>
    {(rowPinning) => {
      const pinnedCount = rowPinning.top?.length ?? 0

      return (
        <button
          type='button'
          aria-label={pinnedCount > 0 ? `Clear ${pinnedCount} pinned rows` : 'Pinned rows'}
          title={pinnedCount > 0 ? `Clear ${pinnedCount} pinned rows` : 'Pinned rows'}
          disabled={pinnedCount === 0}
          onClick={(event) => {
            event.stopPropagation()
            table.resetRowPinning(true)
          }}
          className={cn(
            'flex size-7 items-center justify-center rounded-md transition-colors',
            pinnedCount > 0 ? 'text-orange-400 hover:bg-brand/10 dark:text-light-brand' : 'text-foreground/40'
          )}>
          <Icon name={'pin-fill'} className='size-4' />
        </button>
      )
    }}
  </Subscribe>
)

const PinRowButton = <T extends RowData>({ row }: { row: Row<typeof features, T> }) => {
  const isPinned = row.getIsPinned() === 'top'
  const canPin = row.getCanPin()

  return (
    <button
      type='button'
      aria-label={isPinned ? 'Unpin row' : 'Pin row to top'}
      aria-pressed={isPinned}
      title={isPinned ? 'Unpin row' : 'Pin row to top'}
      disabled={!canPin}
      onClick={(event) => {
        event.stopPropagation()
        row.pin(isPinned ? false : 'top')
      }}
      className={cn(
        'flex size-7 items-center justify-center rounded-md transition-colors',
        isPinned ? 'text-mac-blue' : 'text-muted-foreground hover:bg-sidebar hover:text-foreground',
        !canPin && 'cursor-not-allowed opacity-40'
      )}>
      <Icon name={isPinned ? 'pin-fill' : 'pin'} className={cn('size-5', { 'rotate-30': !isPinned })} />
    </button>
  )
}

function SelectAllCheckbox<T extends RowData>({ table }: { table: Table<typeof features, T> }) {
  const isAll = table.getIsAllPageRowsSelected()
  const isSome = table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()

  return (
    <div className='flex w-9 items-center justify-center md:w-10 md:translate-x-0.5'>
      <Checkbox
        checked={isAll}
        indeterminate={isSome}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(Boolean(checked))}
        aria-label='Select all rows on this page'
        className='flex h-4 w-4 items-center justify-center rounded-[2.75px] bg-sidebar md:mr-4.5 md:ml-2 md:w-8'>
        <Icon
          name={isSome ? 'minus' : isAll ? 'checkbox-checked' : 'checkbox-unchecked'}
          className={cn('size-7 shrink-0', {
            'text-amber-500 dark:text-amber-400': isSome,
            'size-5 text-foreground': isAll,
            'size-5 rotate-0 text-foreground': !isAll && !isSome
          })}
        />
      </Checkbox>
    </div>
  )
}

const SelectRowCheckbox = <T extends RowData>({ row }: { row: Row<typeof features, T> }) => {
  const isChecked = row.getIsSelected()

  return (
    <div className='flex w-4 translate-x-1 items-center justify-center md:-ml-1 md:w-5 md:translate-x-2'>
      <Checkbox.Root
        checked={isChecked}
        disabled={!row.getCanSelect()}
        onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
        aria-label={isChecked ? `Deselect row ${row.id}` : `Select row ${row.id}`}
        className='flex w-6 items-center justify-center'>
        <Icon
          name={isChecked ? 'check' : 'checkbox-unchecked'}
          className={cn('aspect-square h-5 w-5 rounded-sm', {
            'bg-dark-gray text-background opacity-100 dark:bg-mac-blue/80 dark:text-white': isChecked
          })}
        />
      </Checkbox.Root>
    </div>
  )
}

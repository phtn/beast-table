import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import type { Column, ColumnOrderState, ColumnVisibilityState, RowData } from '@octanejs/tanstack-table'
import { useCallback, useMemo, useState } from 'react'
import { mergeColumnOrder } from './column-order'
import type { features } from './Features'
import { getColumnHeaderText } from './filter-utils'
import { Sortable, SortableContent, SortableItem } from './sortable'
import { isColumnVisible } from './Visibility'

interface Props<TData extends RowData> {
  cols: Column<typeof features, TData, unknown>[]
  columnVisibility?: ColumnVisibilityState
  onColumnVisibilityChange?: (
    updater: ColumnVisibilityState | ((old: ColumnVisibilityState) => ColumnVisibilityState)
  ) => void
  columnOrder?: ColumnOrderState
  onColumnOrderChange?: (columnOrder: ColumnOrderState) => void
}

const ColumnViewComponent = <TData extends RowData>({
  cols,
  columnVisibility,
  onColumnVisibilityChange,
  columnOrder,
  onColumnOrderChange
}: Props<TData>) => {
  const [isPositioning, setIsPositioning] = useState(false)
  const hideableColumns = useMemo(() => cols.filter((column) => column.getCanHide()), [cols])
  const reorderableColumnIds = useMemo(
    () => hideableColumns.filter((column) => !column.getIsPinned()).map((column) => column.id),
    [hideableColumns]
  )
  const canPositionColumns = Boolean(onColumnOrderChange && reorderableColumnIds.length > 1)
  const positioningEnabled = isPositioning && canPositionColumns
  const getIsVisible = useCallback(
    (column: Column<typeof features, TData, unknown>) =>
      columnVisibility ? isColumnVisible(column.id, columnVisibility) : column.getIsVisible(),
    [columnVisibility]
  )
  const invisibleColumns = hideableColumns.filter((column) => !getIsVisible(column))

  const handleToggle = useCallback(
    (columnId: string, nextVisible: boolean) => {
      if (onColumnVisibilityChange) {
        onColumnVisibilityChange((old: ColumnVisibilityState) => ({
          ...old,
          [columnId]: nextVisible
        }))
        return
      }

      hideableColumns.find((column) => column.id === columnId)?.toggleVisibility(nextVisible)
    },
    [hideableColumns, onColumnVisibilityChange]
  )
  const handleColumnOrderChange = useCallback(
    (nextReorderableColumnIds: string[]) => {
      if (!onColumnOrderChange) return

      onColumnOrderChange(
        mergeColumnOrder(columnOrder ?? hideableColumns.map((column) => column.id), nextReorderableColumnIds)
      )
    },
    [columnOrder, hideableColumns, onColumnOrderChange]
  )

  return (
    <Sortable value={reorderableColumnIds} onValueChange={handleColumnOrderChange}>
      <Menu.Root>
        <Menu.Trigger
          render={
            <BaseButton
              className={cn(
                'relative h-7.5 md:w-auto flex items-center justify-center rounded-xs portrait:aspect-square',
                'select-none text-foreground text-sm mx-1 md:space-x-1 md:px-2.5 gap-1 w-8.5',
                'data-pressed:bg-zinc-200/50 dark:data-pressed:bg-zinc-800',
                'hover:bg-orange-200/20 dark:hover:bg-mist-100/5 transition-colors duration-75',
                'active:bg-zinc-300 dark:active:bg-zinc-700/40',
                'focus-visible:bg-none focus-visible:-outline-offset-1 focus-visible:outline-1',
                invisibleColumns.length > 0 && 'gap-0 md:ps-2 md:pe-2.5'
              )}>
              {invisibleColumns.length > 0 ? (
                <span className='min-w-6 w-6 md:-ml-0.5 grow-0 rounded-xs bg-sand font-okx font-semibold text-white dark:text-white dark:bg-sand/75'>
                  {invisibleColumns.length > 99 ? '99+' : invisibleColumns.length}
                </span>
              ) : (
                <Icon name='columns' className='size-4 dark:opacity-60 opacity-80' />
              )}
              <span className='hidden font-okx text-sm opacity-80 md:flex'>Columns</span>
            </BaseButton>
          }>
          <Icon name='chevron-down' className='-mr-1' />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner align='start' className='isolate z-50 outline-none' sideOffset={3}>
            <Menu.Popup className='select-none origin-(--transform-origin) w-64 rounded-md border bg-zinc-200/20 dark:bg-zinc-900/50 backdrop-blur-3xl py-1 text-origin shadow-none outline-gray-200 transition-[transform,scale,opacity] data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0 dark:bg-dark-table dark:text-zinc-200'>
              <div className='flex items-center justify-between border-b border-dashed px-4 py-2 font-okx text-sm'>
                <span className='font-okx text-sm text-muted-foreground'>
                  {positioningEnabled ? 'Position Columns' : 'View Options'}
                </span>
                <BaseButton
                  id='column-drag-toggle'
                  type='button'
                  aria-label={positioningEnabled ? 'Show column visibility controls' : 'Reorder columns'}
                  aria-pressed={positioningEnabled}
                  disabled={!canPositionColumns}
                  title={
                    canPositionColumns
                      ? positioningEnabled
                        ? 'Show column visibility controls'
                        : 'Reorder columns'
                      : 'At least two unpinned columns are required to reorder'
                  }
                  onClick={() => setIsPositioning((current) => !current)}
                  className='group/toggle flex size-6 items-center justify-center rounded-sm text-mist-600 transition-colors hover:bg-mist-300/50 dark:hover:bg-mist-300/10 focus-visible:outline-1 disabled:cursor-not-allowed disabled:opacity-40'>
                  <Icon
                    name='arrow-right-col'
                    className={cn(
                      'size-5 text-foreground/40 transition-colors drop-shadow-xs dark:group-hover/toggle:text-orange-200/80',
                      positioningEnabled && 'opacity-100 text-sand dark:text-orange-200'
                    )}
                  />
                </BaseButton>
              </div>

              {positioningEnabled ? (
                <SortableContent asChild>
                  <div className='space-y-1 p-2'>
                    {hideableColumns.map((column) => {
                      const isPinned = Boolean(column.getIsPinned())

                      if (isPinned) {
                        return (
                          <Menu.Item
                            key={column.id}
                            disabled
                            closeOnClick={false}
                            title='Pinned columns keep their pinned position'
                            className='flex h-8 items-center justify-between rounded-sm bg-zinc-200/20 ps-3 pe-2 text-xs text-foreground opacity-60 dark:bg-zinc-300/5'>
                            <span>{getColumnHeaderText(column)}</span>
                            <Icon name='pin-fill' className='size-4' />
                          </Menu.Item>
                        )
                      }

                      return (
                        <SortableItem key={column.id} value={column.id} asHandle asChild>
                          <Menu.Item
                            closeOnClick={false}
                            title={`Drag ${getColumnHeaderText(column)} to reposition it`}
                            className='group/drag flex h-8 items-center justify-between rounded-sm bg-transparent ps-3 pe-2 text-xs text-foreground opacity-100 hover:bg-sand/10 dark:text-white dark:hover:bg-sand/2 dark:hover:text-sand/95'>
                            <span>{getColumnHeaderText(column)}</span>
                            <Icon
                              name='draggable'
                              className='size-5 opacity-60 group-hover/drag:opacity-100 group-hover/drag:text-mist-700 dark:group-hover/drag:text-orange-200'
                            />
                          </Menu.Item>
                        </SortableItem>
                      )
                    })}
                  </div>
                </SortableContent>
              ) : (
                <div className='space-y-1 p-2'>
                  {hideableColumns.map((column) => {
                    const isVisible = getIsVisible(column)

                    return (
                      <Menu.CheckboxItem
                        key={column.id}
                        className={cn(
                          'group/view flex h-8 items-center justify-between opacity-80 bg-zinc-200/40 rounded-sm dark:bg-zinc-300/5 ps-3 pe-2 text-xs text-foreground hover:bg-sand/10 dark:hover:bg-orange-100/5 dark:hover:text-sand/95',
                          isVisible && 'bg-transparent not-italic opacity-100 dark:bg-transparent dark:text-white'
                        )}
                        checked={isVisible}
                        onCheckedChange={(value) => handleToggle(column.id, value)}>
                        <span>{getColumnHeaderText(column)}</span>
                        <Icon
                          name={isVisible ? 'checkbox-checked' : 'checkbox-unchecked'}
                          className={cn('size-5 opacity-60', {
                            'opacity-100 dark:group-hover/view:text-orange-300': isVisible
                          })}
                        />
                      </Menu.CheckboxItem>
                    )
                  })}
                </div>
              )}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </Sortable>
  )
}

export const ColumnView = ColumnViewComponent

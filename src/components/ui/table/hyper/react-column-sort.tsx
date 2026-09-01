import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import { FlexRender, type Header, type RowData, type SortDirection } from '@octanejs/tanstack-table'
import { memo } from 'octane'
import type { features } from './Features'

interface Props<TData extends RowData, TValue> {
  header: Header<typeof features, TData, TValue>
  sorted: SortDirection | false
}
const ColumnSortComponent = <TData extends RowData, TValue>({ header, sorted }: Props<TData, TValue>) => {
  const handleSort = () => {
    if (!header.column.getCanSort()) return
    header.column.toggleSorting(undefined, false)
  }

  return header.isPlaceholder ? null : header.column.getCanSort() ? (
    <button
      type='button'
      className={cn('relative flex h-full w-full cursor-pointer items-center gap-1.5 text-left select-none')}
      onClick={handleSort}
      aria-label={`Sort by ${header.column.id}${sorted ? `, currently ${sorted === 'asc' ? 'ascending' : 'descending'}` : ''}`}>
      <FlexRender header={header} />

      <Icon
        name='arrow-drop-down'
        className={cn('absolute rotate-0 right-0 size-5 text-sand dark:opacity-90 transform-all duration-200', {
          '-rotate-90 text-beach dark:opacity-80': sorted === 'asc',
          'hidden rotate-0': sorted !== 'desc' && sorted !== 'asc'
        })}
      />
    </button>
  ) : (
    <FlexRender header={header} />
  )
}

ColumnSortComponent.displayName = 'ColumnSort'

export const ColumnSort = memo(ColumnSortComponent) as typeof ColumnSortComponent

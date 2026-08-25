export const TABLE_QUERY_LIMITS = {
  columnFilters: 64,
  filterValuesPerColumn: 256,
  loadedRows: 1_000_000,
  pageIndex: 1_000_000,
  pageSize: 500,
  persistedRowIds: 500,
  searchCharacters: 512,
  serializedStateCharacters: 16_384,
  tokenCharacters: 512,
  visibilityEntries: 256
} as const

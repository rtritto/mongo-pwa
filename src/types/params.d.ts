type DoQueryParams = {
  // data: DataCollection
  page?: number | null
  sort?: string | null
  column?: string
  isBackForwardNavigation?: boolean
}

type ColumnsHeader = {
  [key: string]: boolean | null
}

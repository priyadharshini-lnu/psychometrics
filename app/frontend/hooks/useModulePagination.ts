import { useEffect, useState } from 'react'

export function useModulePagination (
  model, elementSelector: string, PaginationContext, insertPaginationPage,
) {
  const [paginationContext, setPaginationContext] = useState(null)

  useEffect(() => {
    if (!model.props.pagination?.enabled) { return }

    if (model.pagination) {
      setPaginationContext(model.pagination)
      return
    }

    const element = document.querySelector(elementSelector)
    const context = new PaginationContext(model, element)

    if (!context.needPagination) {
      return
    }
    setPaginationContext(context.pages[0])
    if (insertPaginationPage) {
      insertPaginationPage(model, context)
    }
  }, [])

  return { paginationContext }
}

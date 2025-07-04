import { useState } from 'react'
import { Filters } from './Types'

export const useFilters = () => {
  const [filters, setFilters] = useState<Filters>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const handleMenuClick = ({ key }: { key: string }) => {
    const newFilters: Filters = {
      sortBy: 'createdAt',
      sortOrder: filters.sortOrder,
    }
    if (key !== 'sortBy' && filters[key] !== true) {
      newFilters[key] = true
    } else if (key === 'sortBy') {
      newFilters.sortOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc'
    }
    setFilters(newFilters)
  }

  return { filters, handleMenuClick }
}

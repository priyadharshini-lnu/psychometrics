import { Tag } from 'antd'
import { getFilterLabel, resolveFilterValues, FilterOptions } from './helpers'

export const RenderTags = ({ selectedFilters, handleFilterChange, filterOptions }: {
  selectedFilters: { [key: string]: string[] | string },
  handleFilterChange: (key: string, value: string | null) => void,
  filterOptions?: FilterOptions,
}) => (
  <>
    {Object.entries(selectedFilters).map(([key, value]) => {
      const filterLabel = getFilterLabel(key)
      const filterValue = resolveFilterValues(key, value, filterOptions)
      return (
        <Tag
          style={{ padding: '4px', margin: 0 }}
          key={key}
          closable
          onClose={() => {
            handleFilterChange(key, null)
          }}
        >
          <strong>{filterLabel}</strong>
          {' '}
          :
          {' '}
          {filterValue}
        </Tag>
      )
    })}
  </>
)

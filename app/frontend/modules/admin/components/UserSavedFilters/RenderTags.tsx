import { Tag } from 'antd'
import { toTitleCase } from './helpers'

export const RenderTags = ({ selectedFilters, handleFilterChange }: {
  selectedFilters: { [key: string]: string[] | string },
  handleFilterChange: (key: string, value: string | null) => void,
}) => (
  <>
    {Object.entries(selectedFilters).map(([key, value]) => {
      const filterLabel = toTitleCase(key)
      let filterValue: string
      if (Array.isArray(value)) {
        filterValue = value.join(', ')
      } else {
        filterValue = value
      }
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

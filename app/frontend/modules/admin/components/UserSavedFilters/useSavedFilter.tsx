import {
  Flex, MenuProps, Button, Tooltip, Empty,
} from 'antd'
import { useEffect, useState } from 'react'
import qs from 'qs'
import {
  DeleteOutlined, EditOutlined, PlusOutlined, StarFilled, StarOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { ResourceType, UserSavedFilter } from './core'
import { useUserSavedFiltersApi } from './useSavedFiltersApi'
import { generateSmartFilterName, FilterOptions } from './helpers'
import { UrlQuery } from '~/hooks/useResources/interfaces'

import { FilterComponent } from './FilterComponent'
import { SavedFiltersDropdown } from './SavedFiltersDropdown'
import { RenderTags } from './RenderTags'

const { I18n } = window

export const useSavedFilter = (
  changeFilter: (filter: string, value: string | string[] | null) => void,
  changeUrlQuery: (query: UrlQuery) => void,
  resourceType: ResourceType,
  filterOptions?: FilterOptions,
) => {
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] | string }>({})
  const [selectedFilterId, setSelectedFilterId] = useState<string>('')
  const [isNewFilterSave, setIsNewFilterSave] = useState<boolean>(false)
  const [editFilterName, setEditFilterName] = useState<boolean>(false)
  const [savedFilters, setSavedFilters] = useState<UserSavedFilter[] | null>(null)
  const [filterName, setFilterName] = useState<string>('')
  const [queryState] = useState<UrlQuery>(qs.parse(location.search.substring(1))?.q)

  const {
    fetchFilters, createFilter, updateFilter, deleteFilter,
  } = useUserSavedFiltersApi()


  const savedFilterMenuItems: MenuProps['items'] = savedFilters && savedFilters.length > 0
    ? savedFilters.flatMap((filter: UserSavedFilter, index: number) => [
      {
        label: (
          <Flex style={{ width: '100%' }} align="baseline" justify="space-between">
            <Tooltip
              style={{
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '300px',
              }}
              title={filter.name}
            >
              <span>{filter.name}</span>
            </Tooltip>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                type="link"
                icon={filter.favorite ? <StarFilled /> : <StarOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  updateFilter(filter.id, 'setFavorite', { favorite: true }, 'set_favorite')
                    .then(() => fetchFilters(resourceType).then(setSavedFilters))
                }}
              />
              <Button
                type="link"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  deleteFilter(filter.id).then(() => fetchFilters(resourceType).then(setSavedFilters))
                }}
              />
            </div>
          </Flex>
        ),
        key: index,
        onClick: () => {
          setSelectedFilters(filter.filter_params)
          setSelectedFilterId(filter.id)
          const tempFilters = queryState ? { ...queryState?.filter } : {}
          Object.entries(filter.filter_params).forEach(
            ([key, value]) => {
              tempFilters[key] = value
            },
          )
          const finalQuery = {
            ...queryState,
            filter: tempFilters,
            page: { number: 1, size: queryState?.page?.size },
          }
          changeUrlQuery(finalQuery)
        },
      },
      { type: 'divider' },
    ])
    : [{
      label: <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={I18n.t('admin.report_approval_saving_filters_no_saved_filters')}
      />,
      key: '1',
    }]

  useEffect(() => {
    const urlFilters = queryState?.filter
    if (urlFilters) {
      setSelectedFilters(urlFilters)
    }
    fetchFilters(resourceType).then((data) => {
      setSavedFilters(data)
      const tempFilters = queryState ? { ...queryState?.filter } : {}
      const getFavoriteItem = data?.filter((item: UserSavedFilter) => item.favorite)

      if (getFavoriteItem && getFavoriteItem.length > 0) {
        setSelectedFilters(getFavoriteItem[0]?.filter_params)
        setSelectedFilterId(getFavoriteItem[0]?.id)
        Object.entries(getFavoriteItem[0]?.filter_params).forEach(
          ([key, value]) => {
            tempFilters[key] = value as string | string[]
          },
        )
        const finalQuery = {
          ...queryState,
          filter: tempFilters,
          page: { number: 1, size: queryState?.page?.size },
        }
        changeUrlQuery(finalQuery)
      }
    })
  }, [resourceType, queryState])

  useEffect(() => {
    const name = getFilterName(selectedFilterId)
    setFilterName(name || '')
  }, [selectedFilterId, selectedFilters, filterOptions])

  const handleFilterChange = (filter: string, value: string | string[] | null) => {
    if (!value) {
      changeFilter(filter, null)
    }
    if (value) {
      const values = typeof value === 'string' ? value.split(',').map(v => v.trim()) : value
      setSelectedFilters(prev => ({ ...prev, [filter]: values }))
    } else {
      setSelectedFilters((prev) => {
        const newFilters = { ...prev }
        delete newFilters[filter]
        return newFilters
      })
    }
  }

  const handleFilterNameSave = () => {
    if (isNewFilterSave) {
      const requestBody = {
        name: filterName,
        resource_type: resourceType,
        filter_params: selectedFilters,
      }
      createFilter(requestBody).then((data) => {
        setSelectedFilterId((data as UserSavedFilter).id)
        setEditFilterName(false)
        setIsNewFilterSave(false)
        fetchFilters(resourceType).then(setSavedFilters)
      })
    } else {
      updateFilter(selectedFilterId, 'changeName', { name: filterName }, 'edit_filter_name').then(() => {
        setEditFilterName(false)
        fetchFilters(resourceType).then(setSavedFilters)
      })
    }
  }

  const handleClearFilters = () => {
    const tempFilters = queryState ? { ...queryState?.filter } : {}

    Object.entries(selectedFilters).map(([key]) => {
      tempFilters[key] = []
    })
    const finalQuery = {
      ...queryState,
      filter: tempFilters,
      page: { number: 1, size: queryState?.page?.size },
    }
    changeUrlQuery(finalQuery)
    setSelectedFilterId('')
    setSelectedFilters({})
  }

  const getFilterName = (id: string) => {
    if (id) {
      const getFiltersFromId = savedFilters?.filter((item: UserSavedFilter) => item.id === id)
      if (getFiltersFromId && getFiltersFromId?.length > 0) {
        return getFiltersFromId[0].name
      }
      return ''
    }
    return generateSmartFilterName(selectedFilters, filterOptions)
  }

  const handleDeleteFilter = () => {
    setSelectedFilterId('')
    handleClearFilters()
    setSelectedFilters({})
    fetchFilters(resourceType).then(setSavedFilters)
  }

  return {
    handleFilterChange,
    FilterComponent: () => (
      <FilterComponent
        editFilterName={editFilterName}
        isNewFilterSave={isNewFilterSave}
        filterName={filterName}
        setFilterName={setFilterName}
        handleFilterNameSave={handleFilterNameSave}
        setEditFilterName={setEditFilterName}
        setIsNewFilterSave={setIsNewFilterSave}
        selectedFilterId={selectedFilterId}
        getFilterName={getFilterName}
        EditAndDeleteControls={() => (
          <>
            {savedFilters?.some(f => f.id === selectedFilterId) && Object.keys(selectedFilters).length !== 0 && (
              <>
                <Button type="link" icon={<EditOutlined />} onClick={() => setEditFilterName(true)} />
                <Button
                  type="link"
                  icon={savedFilters?.find(f => f.id === selectedFilterId)?.favorite
                    ? <StarFilled /> : <StarOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    updateFilter(selectedFilterId, 'setFavorite', { favorite: true }, 'set_favorite')
                      .then(() => fetchFilters(resourceType).then(setSavedFilters))
                  }}
                />
                <Button
                  type="link"
                  icon={<DeleteOutlined />}
                  onClick={e => deleteFilter(selectedFilterId).then(() => {
                    e.stopPropagation()
                    handleDeleteFilter()
                  })}
                />
              </>
            )}
          </>
        )}
        RenderTags={() => (
          <RenderTags
            selectedFilters={selectedFilters}
            handleFilterChange={handleFilterChange}
            filterOptions={filterOptions}
          />
        )}
        selectedFilters={selectedFilters}
        Actions={() => (
          <>
            {selectedFilterId && (
              <Button
                type="primary"
                onClick={() => updateFilter(selectedFilterId, 'updateFilter', { filter_params: selectedFilters },
                  'filter_updated').then(() => fetchFilters(resourceType).then(setSavedFilters))}
              >
                {I18n.t('shared.save')}
              </Button>
            )}
            <Button onClick={() => setIsNewFilterSave(true)} icon={<PlusOutlined />}>
              {I18n.t('admin.report_approval_saving_filters_actions_save_new_filter')}
            </Button>
            {selectedFilterId && (
              <Button
                icon={<DeleteOutlined />}
                onClick={() => deleteFilter(selectedFilterId).then(() => {
                  handleClearFilters()
                  fetchFilters(resourceType).then(setSavedFilters)
                })}
              >
                {I18n.t('admin.report_approval_saving_filters_actions_delete_filter')}
              </Button>
            )}
            <Button onClick={handleClearFilters}>
              {I18n.t('admin.report_approval_saving_filters_actions_clear_filters')}
            </Button>
          </>
        )}
        SavedFiltersDropdown={() => <SavedFiltersDropdown savedFilters={savedFilterMenuItems} />}
      />
    ),
  }
}

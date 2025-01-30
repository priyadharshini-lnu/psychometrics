import { useEffect, useState } from 'react'
import _ from 'lodash'

export function useSelectAll<T extends {id: React.Key}> (initialState: boolean, items: T[]) {
  const [isAllSelected, setIsAllSelected] = useState(initialState)
  const [excludedKeys, setExcludedKeys] = useState<React.Key[]>([])
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([])

  useEffect(() => {
    if (isAllSelected) {
      const selectedRow = items.filter(item => !excludedKeys.includes(item.id)).map(item => item.id)
      setSelectedKeys(selectedRow)
    }
  }, [items, isAllSelected])

  function onAllSelect (val: boolean) {
    if (val && isAllSelected) {
      const newSelection = [...selectedKeys, ...excludedKeys]
      setExcludedKeys([])
      onSelectionChange(newSelection)
    }
    setIsAllSelected(val)
    if (!val) {
      setSelectedKeys([])
      setExcludedKeys([])
    }
  }

  function onSelectionChange (newSelection: React.Key[]) {
    setSelectedKeys(newSelection)
    if (isAllSelected) {
      const excludedFromCurrSelection = _.difference(selectedKeys, newSelection)
      setExcludedKeys((currExcludedKeys) => {
        const newExcludedKeys = [...currExcludedKeys, ...excludedFromCurrSelection]
        const selectedFromCurrExclusion = _.intersection(newSelection, excludedKeys)
        return selectedFromCurrExclusion.length
          ? newExcludedKeys.filter(key => !selectedFromCurrExclusion.includes(key))
          : newExcludedKeys
      })
    }
  }

  return {
    isAllSelected,
    excludedKeys,
    selectedKeys,
    onSelectionChange,
    onAllSelect,
  }
}

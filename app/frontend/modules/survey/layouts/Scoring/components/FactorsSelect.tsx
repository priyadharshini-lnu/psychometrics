import { Select } from 'antd'
import _ from 'lodash'
import { useMemo, useState, useCallback } from 'react'

const ALLOWED_SCORING_STRATEGIES = ['questions', 'questions_sum', 'questions_percentage']

type Option = {
  label: string;
  value: string;
};

const renderOptions = (factors): Option[] => _.chain(factors)
  .filter(f => ALLOWED_SCORING_STRATEGIES.includes(f.scoring_strategy))
  .flatMap(factor => [
    { label: factor.name, value: factor.id },
    ..._.map(factor.sub_factors?.list, subFactor => ({
      label: subFactor.name, value: subFactor.id,
    })),
  ])
  .compact()
  .value()

const normalizeRegex = /\s/g

const renderFilteredOptions = (options: Option[], searchTerm: string) => {
  const normalizedSearchTerm = searchTerm.toLowerCase().replace(normalizeRegex, '')
  const filteredOptions = _.filter(options, (option) => {
    const normalizedOptionLabel = option.label.toLowerCase().replace(normalizeRegex, '')
    return _.includes(normalizedOptionLabel, normalizedSearchTerm)
  })
  return filteredOptions
}

const FactorsSelect = ({ factors, selectedFactor, selectFactor }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSetSearchTerm = useMemo(() => _.debounce(setSearchTerm, 300), [])

  const allOptions = useMemo(() => renderOptions(factors), [factors])
  const options = useMemo(() => renderFilteredOptions(allOptions, searchTerm), [allOptions, searchTerm])

  const handleSearch = useCallback(value => debouncedSetSearchTerm(value), [debouncedSetSearchTerm])

  return (
    <>
      <Select
        style={{ width: '200px' }}
        placeholder="Please select"
        defaultValue={selectedFactor.id || 'Choose Factor'}
        options={options}
        filterOption={false}
        showSearch
        onChange={selectFactor}
        onSearch={handleSearch}
      />
    </>
  )
}

export default FactorsSelect

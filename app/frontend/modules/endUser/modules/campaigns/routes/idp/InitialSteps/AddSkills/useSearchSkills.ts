import { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  fetchIdpSkills,
} from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'

export const useSearchSkills = () => {
  const [searchResults, setSearchResults] = useState<{ id: string; name: string }[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const dispatch = useDispatch()

  const handleSearch = (value, skillType) => {
    setIsSearching(true)
    dispatch(fetchIdpSkills({
      filterByCategory: skillType,
      nameCont: value,
    })).then(({ response }) => {
      setIsSearching(false)
      setSearchResults(response)
    })
  }

  return {
    searchResults,
    isSearching,
    handleSearch,
  }
}

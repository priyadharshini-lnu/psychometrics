
import { useState } from 'react'
import { useResources } from '~/hooks/useResources'
import { UserIdpSkills } from '~/modules/admin/modules/campaigns/core/UserIdpPlan'

export const useSearchSkills = (idpTemplateId) => {
  const [searchResults, setSearchResults] = useState<{ id: string; name: string, skillType: string }[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const {
    fetch: fetchIdpSkillDetails,
  } = useResources<UserIdpSkills>(
    'skills', {
      apiConfig: {
        include: ['development_actions'],
      },
    },
  )


  const handleSearch = (value, skillType) => {
    setIsSearching(true)
    fetchIdpSkillDetails({
      apiConfig: {
        filter: {
          name_cont: value,
          by_idp_template_id: idpTemplateId as string,
          filter_by_skill_type: skillType,
        },
      },
    }).then(({ data }) => {
      setIsSearching(false)
      setSearchResults(data)
    })
  }

  return {
    searchResults,
    isSearching,
    handleSearch,
  }
}

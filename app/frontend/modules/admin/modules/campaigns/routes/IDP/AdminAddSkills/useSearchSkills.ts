
import { useState } from 'react'
import { useResources } from '~/hooks/useResources'
import { UserIdpSkills } from '~/modules/admin/modules/campaigns/core/UserIdpPlan'

export const useSearchSkills = (idpPlanId) => {
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
          filter_by_skill_type: skillType,
          available_skills_by_plan_id: idpPlanId as string,
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

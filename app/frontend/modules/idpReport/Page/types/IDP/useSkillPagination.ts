import { useState, useEffect } from 'react'
import _ from 'lodash'

type Pagination = {[skillId:string]: string[]}
const CONTAINER_HEIGHT = 630
const SKILL_HEADER = 32
const SKILL_GAP = 20
const SKILL_PADDING = 12
const ROW_GAP = 17 // 16 + 1 for divider

export const useSkillPagination = (skills, container) => {
  const [pages, setPages] = useState<Pagination[]>([])

  useEffect(() => {
    if (container.current) {
      const cont = container.current
      const newPages: Pagination[] = []
      let currentPage: Pagination = {}
      let currentPageHeight = 0
      Array.from(cont.children).forEach((skillElement: HTMLDivElement) => {
        currentPageHeight += SKILL_PADDING + SKILL_HEADER + ROW_GAP
        const skillId = skillElement.getAttribute('data-skill-id') as string
        if (!currentPage[skillId]) {
          currentPage[skillId] = []
        }

        skillElement.querySelectorAll('[data-development-action-id]').forEach((daElement) => {
          const daId = daElement.getAttribute('data-development-action-id') as string
          currentPageHeight += daElement.clientHeight
          if (currentPageHeight <= CONTAINER_HEIGHT) {
            currentPage[skillId].push(daId)
            currentPageHeight += ROW_GAP
          } else {
            newPages.push(currentPage)
            currentPage = { [skillId]: [daId] }
            currentPageHeight = daElement.clientHeight + SKILL_PADDING + SKILL_HEADER + ROW_GAP
          }
        })
        currentPageHeight += SKILL_PADDING + SKILL_GAP
      })
      if (!_.isEmpty(currentPage)) {
        newPages.push(currentPage)
      }
      setPages(newPages)
    }
  }, [skills, container])

  return [pages]
}


export const getPaginatedSkills = (skills, page: Pagination) => {
  const selectedSkills: {user_idp_development_actions: []}[] = []
  Object.entries(page).forEach(([skillId, daIds]) => {
    const skill = skills.find(s => s.id.toString() === skillId)
    if (skill) {
      const filteredDAs = skill.user_idp_development_actions.filter(da => daIds.includes(da.id.toString()))
      if (skill.user_idp_development_actions.length > 0 && filteredDAs.length === 0) {
        // this can happen if all DAs for this skill don't fit on the page
        return
      }
      selectedSkills.push({
        ...skill,
        user_idp_development_actions: filteredDAs,
      })
    }
  })
  return selectedSkills
}

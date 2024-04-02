import { useEffect } from 'react'
import { AddSkillsStep } from '~/components/IdpShared/InitialSteps/AddSkillsStep'

export const AddSkills = ({ next }) => {
  useEffect(() => {
    // fetch saved skills
  }, [])

  return (
    <AddSkillsStep next={next} />
  )
}

import BehaviouralPage from './BehaviouralPage'
import TechnicalPage from './TechnicalPage'
import { useUserIdp } from '~/modules/idpReport/hooks/useIdpData'

const IDP = ({ rtl }) => {
  const { user_idp_skills: skills, status } = useUserIdp()

  const behavioralSkills = skills.filter(skill => skill.skill_type === 'behavioral')
  const technicalSkills = skills.filter(skill => skill.skill_type === 'technical')

  return (
    <>
      {behavioralSkills.length > 0 && <BehaviouralPage skills={behavioralSkills} rtl={rtl} status={status} />}
      {technicalSkills.length > 0 && <TechnicalPage skills={technicalSkills} rtl={rtl} status={status} />}
    </>
  )
}

export default IDP

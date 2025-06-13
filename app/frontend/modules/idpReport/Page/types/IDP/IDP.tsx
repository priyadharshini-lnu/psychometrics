import BehaviouralPage from './BehaviouralPage'
import TechnicalPage from './TechnicalPage'
import { useAppSelector } from '~/modules/idpReport/hooks/redux'

const { I18n } = window
I18n.locale = document.body.getAttribute('data-locale')

const IDP = ({ rtl }) => {
  const { user_idp_skills: skills } = useAppSelector(state => state.idp.userIdp)

  const behavioralSkills = skills.filter(skill => skill.skillType === 'behavioral')
  const technicalSkills = skills.filter(skill => skill.skillType === 'technical')

  return (
    <>
      {behavioralSkills.length > 0 && <BehaviouralPage skills={behavioralSkills} rtl={rtl} />}
      {technicalSkills.length > 0 && <TechnicalPage skills={technicalSkills} rtl={rtl} />}
    </>
  )
}

export default IDP

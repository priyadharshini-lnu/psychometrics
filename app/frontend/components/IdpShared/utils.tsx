import { USER_IDP_SKILL } from './constants'

export const renderSkillCategoryIcon = (category, style = {}) => {
  const IconComponent = USER_IDP_SKILL[category]?.Icon

  return IconComponent && (
    <IconComponent
      height="100%"
      width="100%"
      style={{
        justifyContent: 'center',
        ...style,
      }}
    />
  )
}

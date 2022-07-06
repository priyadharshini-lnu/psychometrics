
import React from 'react'
import { getCookieValue } from 'utils/cookie'

export const ToggleEndUserViewLink: React.FC<{}> = () => {
  if (window.PsyGlobalState.features.new_end_user_view) {
    return (
      <a href={`/switch_end_user_view?view=${getCookieValue('end_user_view') === 'new' ? 'old' : 'new'}`}>
        Toggle View
      </a>
    )
  }
  return null
}

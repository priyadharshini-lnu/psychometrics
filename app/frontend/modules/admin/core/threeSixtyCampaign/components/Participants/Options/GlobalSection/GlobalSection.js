import React from 'react'
import OptionSection from 'modules/admin/core/threeSixtyCampaign/components/common/Options/Section'
import ExpandableOption from 'modules/admin/core/threeSixtyCampaign/components/common/Options/Expandable'

export default function GlobalSection ({
  options,
  updateParticipantOptions,
}) {
  const OBJECT_KEY = 'global'

  const parametersForSwitch = name => ({
    value: options[name],
    onOptionChanged: updateParticipantOptions([OBJECT_KEY, name]),
  })

  return (
    <OptionSection label="Global Options">
      <ExpandableOption
        label={I18n.t('threesixty.options.global.cannot_re_edit')}
        {...parametersForSwitch('canNotEditEvaluation')}
      />
    </OptionSection>
  )
}

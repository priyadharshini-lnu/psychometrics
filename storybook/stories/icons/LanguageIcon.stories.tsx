import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { LanguageIcon } from '~/glint/icons/LanguageIcon'

export default {
  title: 'Icons/LanguageIcon',
  component: LanguageIcon,
} as ComponentMeta<typeof LanguageIcon>

const Template: ComponentStory<typeof LanguageIcon> = args => <LanguageIcon {...args} />

export const Icon = Template.bind({})

import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import '../../app/frontend/styles/ant.less'

import { LanguageIcon } from '../../app/frontend/glint/icons/LanguageIcon'

export default {
  title: 'Icons/LanguageIcon',
  component: LanguageIcon,
} as ComponentMeta<typeof LanguageIcon>

const Template: ComponentStory<typeof LanguageIcon> = args => <LanguageIcon {...args} />

export const Icon = Template.bind({})

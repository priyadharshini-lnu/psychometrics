import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { ViewsContainer } from '~/glint/components/ViewsContainer'

export default {
  title: 'Components/ViewsContainer',
  component: ViewsContainer,
} as ComponentMeta<typeof ViewsContainer>

const ViewsContainerStory = () => {
  const hanndleViewSelect = (view) => {
    // eslint-disable-next-line no-console
    console.log(view)
  }

  const renderChild = view => (view === 'list' ? 'This is List view' : 'This is Table view')

  return (
    <div style={{ padding: '24px', height: '200px', border: '1px solid #d3d3d3' }}>
      <ViewsContainer title="Content Title" onViewChange={hanndleViewSelect}>
        {renderChild}
      </ViewsContainer>
    </div>
  )
}

const Template: ComponentStory<typeof ViewsContainer> = () => <ViewsContainerStory />

export const Simple = Template.bind({})

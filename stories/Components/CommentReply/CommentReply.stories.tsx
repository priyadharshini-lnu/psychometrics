import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { CommentReply } from '~/glint'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import styles from './styles.less'

export default {
  title: 'Components/CommentReply',
  component: CommentReply,
  argTypes: {
    status: {
      control: false,
    },
  },
} as ComponentMeta<typeof CommentReply>

const Template: ComponentStory<typeof CommentReply> = (args) => {
  const [loading, setLoading] = useState(false)

  const handleSend = (commentObject) => {
    setLoading(true)
    // eslint-disable-next-line no-console
    const saveComment = new Promise((resolve) => {
      setTimeout(() => {
        resolve('resolved')
      }, 3000)
    })
    saveComment.then(() => {
      setLoading(false)
      // eslint-disable-next-line no-console
      console.log('Comment saved successfully', commentObject)
    })
  }
  return (
    <div className={styles.container}><CommentReply {...args} inputLoading={loading} onSendReply={handleSend} /></div>
  )
}

export const Simple = Template.bind({})

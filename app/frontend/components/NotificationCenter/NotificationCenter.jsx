import { Component } from 'react'
import { notification } from 'antd'
import { SafeHTML } from '~/components/SafeHTML'
import consumer from '~/core/consumer'

export default class NotificationCenter extends Component {
  componentDidMount () {
    consumer().subscriptions.create('NotificationChannel', {
      received: (data) => {
        const config = {
          message: data.message,
          description: <SafeHTML html={data.description} />,
          duration: 0,
        }
        const type = data.type || 'success'
        notification[type](config)
      },
    })
  }

  render () {
    return (
      <div />
    )
  }
}

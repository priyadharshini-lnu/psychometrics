/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import { notification } from 'antd'

export default class NotificationCenter extends Component {
  componentDidMount () {
    window.App.notifications = window.App.cable.subscriptions.create('NotificationChannel', {
      received: (data) => {
        const config = {
          message: data.message,
          description: <div dangerouslySetInnerHTML={{ __html: data.description }} />,
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

/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import { notification } from 'antd'

export default class NotificationCenter extends Component {
  componentDidMount () {
    window.App.notifications = window.App.cable.subscriptions.create('NotificationChannel', {
      received: (data) => {
        notification.open({
          message: data.message,
          description: <div dangerouslySetInnerHTML={{ __html: data.description }} />,
          duration: 0,
        })
      },
    })
  }

  render () {
    return (
      <div />
    )
  }
}

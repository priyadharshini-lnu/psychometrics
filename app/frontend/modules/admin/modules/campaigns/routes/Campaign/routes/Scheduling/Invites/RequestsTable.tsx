import {
  Table, Tag, Button, List, Avatar, Space,
} from 'antd'
import moment from 'moment'
import styles from './styles.less'

export const RequestsTable = () => {
  const dataSource = [
    {
      name: {
        title: 'Mr',
        first: 'Joey',
        last: 'Crawford',
      },
      email: 'joey.crawford@example.com',
      picture: {
        large: 'https://randomuser.me/api/portraits/men/33.jpg',
        medium: 'https://randomuser.me/api/portraits/med/men/33.jpg',
        thumbnail: 'https://randomuser.me/api/portraits/thumb/men/33.jpg',
      },
      type: 'Rescheduling',
      time: '2023-07-07T10:16:36.677+03:00',
      reason: 'industry. Lorem Ipsum has been the industrys standard dummy text ever ',
    },
    {
      name: {
        title: 'Mr',
        first: 'پوریا',
        last: 'سالاری',
      },
      email: 'pwry.slry@example.com',
      picture: {
        large: 'https://randomuser.me/api/portraits/men/34.jpg',
        medium: 'https://randomuser.me/api/portraits/med/men/34.jpg',
        thumbnail: 'https://randomuser.me/api/portraits/thumb/men/34.jpg',
      },
      type: 'Cancelation',
      time: '2023-07-07T10:16:36.677+03:00',
      reason: 'industry. Lorem Ipsum has been the industrys standard dummy text ever',
    },
  ]

  const columns = [
    {
      title: 'Subject Name',
      key: 'subject',
      width: '20%',
      render (item) {
        return (
          <List.Item.Meta
            className={styles.subject}
            avatar={<Avatar size="large" src={item.picture.large} />}
            title={`${item.name.first} ${item.name.last}`}
            description={item.email}
          />
        )
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Date/Time',
      key: 'date',
      render (data) {
        return <Tag>{moment(data.time).format('Do MMMM YYYY, h:mm a')}</Tag>
      },
    },
    {
      title: 'Reason',
      width: '30%',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Action',
      key: 'actions',
      width: '10%',
      className: styles.actionsCol,
      render () {
        return (
          <Space>
            <Button type="link">Cancel Booking</Button>
            <Button type="link">Reschedule</Button>
          </Space>
        )
      },
    },
  ]

  return (
    <Table
      className={styles.table}
      bordered={false}
      dataSource={dataSource}
      columns={columns}
      pagination={false}
    />
  )
}

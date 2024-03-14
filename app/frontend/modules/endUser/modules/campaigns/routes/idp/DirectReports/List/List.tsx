import {
  Typography, List, Avatar, Checkbox,
} from 'antd'
import { Link } from 'react-router-dom'
import { BoxWithShadow } from '~/glint'

const { I18n } = window

const data = [
  {
    title: 'Ant Design Title 1',
  },
  {
    title: 'Ant Design Title 2',
  },
  {
    title: 'Ant Design Title 3',
  },
  {
    title: 'Ant Design Title 4',
  },
]

// replace all inline styles with DirectReportsList.less
export const DirectReportsList = () => (
  <div style={{ padding: 80 }}>
    <Typography.Title level={3}>{I18n.t('idp.my_direct_reports')}</Typography.Title>
    <BoxWithShadow style={{ padding: '24px', marginTop: 16, minHeight: 400 }}>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item, index) => (
          <List.Item>
            <Checkbox />
            <List.Item.Meta
              avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
              title={<a href="https://ant.design">{item.title}</a>}
              description="Ant Design, a design language for background applications, is refined by Ant UED Team"
            />
            <Link to="/idp/direct_reports/1">{I18n.t('idp.details')}</Link>
          </List.Item>
        )}
      />
    </BoxWithShadow>
  </div>
)

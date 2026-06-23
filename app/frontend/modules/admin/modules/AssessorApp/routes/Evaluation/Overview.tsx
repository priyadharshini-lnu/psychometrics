import {
  Avatar,
  Table,
} from 'antd'
import _ from 'lodash'
import ReactMarkdown from 'react-markdown'
import { UserOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { SafeHTML } from '~/components/SafeHTML'
import styles from './styles.less'

const { I18n } = window

const Overview = ({
  userInfo,
}) => (
  <div className={styles.overviewContent}>
    <div className={styles.nameContainer}>
      <div className={styles.photo}>
        <Avatar
          className={styles.avatar}
          src={userInfo.user?.photo}
          shape="square"
          size="large"
          icon={<UserOutlined />}
        />
      </div>
      <div>
        <div className={styles.name}>
          {userInfo.user?.first_name}
          {' '}
          {userInfo.user?.last_name}
        </div>
        <div>
          {userInfo.user?.email}
        </div>
        {(userInfo.user?.age || userInfo.user?.gender) && (
          <div className={styles.additional}>
            {_.compact([
              userInfo.user?.age ? I18n.t('admin.years', { count: userInfo.user.age }) : null,
              userInfo.user?.gender ? I18n.t(`admin.genders_${userInfo.user.gender}`) : null,
            ]).join(', ')}
          </div>
        )}
      </div>
    </div>
    <div className={styles.datasheet}>
      <Table
        showHeader={false}
        className={styles.table}
        columns={[{
          title: I18n.t('user.datasheet.attribute'),
          dataIndex: 'key',
          key: 'key',
          render (value) {
            return <b>{value}</b>
          },
        }, {
          title: I18n.t('user.datasheet.value'),
          dataIndex: 'value',
          key: 'value',
          render (value, row) {
            const type = userInfo.datasheet_columns
              .find(({
                name,
              }) => name === row.key)?.column_type?.toLowerCase()
            switch (type) {
              case 'markdown':
                return <ReactMarkdown>{value}</ReactMarkdown>
              case 'html':
                return <SafeHTML as="div" html={`${value}`} />
              default:
                return value
            }
          },
        }]}
        dataSource={_.map(userInfo.datasheet, (v, k) => ({ key: k, value: v }))}
        pagination={false}
        rowKey={row => row.key}
      />
    </div>
  </div>
)

export default Overview

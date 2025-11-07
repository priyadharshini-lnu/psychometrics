import { Typography, Flex, Tag } from 'antd'
import { SafeHTML } from '~/components/SafeHTML'
import { ChangeStatusColors, PlanChangeStatus } from '../../../core/idp/utils'
import styles from './ChangeHistory.less'

const { I18n } = window
export const ChangeHistory = ({ changeHistory }) => (
  <Flex className="ms-4" vertical>
    <Typography.Title level={5}>{I18n.t('idp.change_history')}</Typography.Title>

    <ul className="ps-4">
      {changeHistory?.updatedDA && changeHistory?.updatedDA.length && (
        <li className={styles.changeItem}>
          {I18n.t('idp.history.modified_da', { count: changeHistory.updatedDA.length })}
          :
          {' '}
          {changeHistory.updatedDA.map((change, index) => (
            <Tag key={`updated-${index}`} color={ChangeStatusColors[PlanChangeStatus.EDITED]}>
              <SafeHTML html={change} />
            </Tag>
          ))}
        </li>
      )}

      {changeHistory?.addedDA && changeHistory?.addedDA.length && (
        <li className={styles.changeItem}>
          {I18n.t('idp.history.added_da', { count: changeHistory.addedDA.length })}
          :
          {' '}
          {changeHistory.addedDA.map((change, index) => (
            <Tag key={`added-${index}`} color={ChangeStatusColors[PlanChangeStatus.ADDED]}>
              <SafeHTML html={change} />
            </Tag>
          ))}
        </li>
      )}

      {changeHistory?.removedDA && changeHistory?.removedDA.length && (
        <li className={styles.changeItem}>
          {I18n.t('idp.history.removed_da', { count: changeHistory.removedDA.length })}
          :
          {' '}
          {changeHistory.removedDA.map((change, index) => (
            <Tag key={`removed-${index}`} color={ChangeStatusColors[PlanChangeStatus.REMOVED]}>
              <SafeHTML html={change} />
            </Tag>
          ))}
        </li>
      )}
    </ul>
  </Flex>
)

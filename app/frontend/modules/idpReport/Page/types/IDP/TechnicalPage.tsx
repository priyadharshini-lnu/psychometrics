import {
  useRef,
} from 'react'
import { Flex } from 'antd'
import cs from 'classnames'
import _ from 'lodash'
import styles from './IDP.less'
import Page from '../../Page'
import techicalIcon from '../../../assets/Technical.svg'
import { Skill } from './DevelopmentAction'
import { useI18n } from '~/modules/idpReport/I18nContext'
import { useSkillPagination, getPaginatedSkills, Pagination } from './useSkillPagination'

const { I18n } = window
I18n.locale = document.body.getAttribute('data-locale')

const CONTAINER_HEIGHT = 630

const Technical = ({ skills, rtl, status }) => {
  const container = useRef<HTMLDivElement>(null)
  const I18n = useI18n()

  const [pages] = useSkillPagination(skills, container)

  return (
    <>
      {_.map(pages.length ? pages : [0], (page) => {
        const selectedSkills = page ? getPaginatedSkills(skills, page as Pagination) : skills

        return (
          <Page rtl={rtl}>
            <div className={cs(styles.content)}>
              <Flex vertical style={{ height: '100%' }} justify="space-between">
                <Flex gap={20} vertical>
                  <Flex className={styles.header} justify="space-between" align="center">
                    <Flex gap={12}>
                      <img src={techicalIcon} className={styles.icon} />
                      <Flex vertical justify="space-between">
                        <h1 className={styles.title}>
                          {I18n.t('idp.pdf.idp.title')}
                        </h1>
                        <div className={styles.subtitle}>
                          {I18n.t('idp.pdf.idp.subtitle.technical')}
                        </div>
                      </Flex>
                    </Flex>
                    <Flex>
                      <Flex vertical gap={8}>
                        <div className={styles.statusLabel}>
                          {I18n.t('idp.pdf.approval_status')}
                        </div>
                        <Flex gap={16} align="center">
                          <div className={cs(styles.statusBox, { [styles.active]: status === 'draft' })}>
                            {I18n.t('idp.pdf.statuses.not_reviewed')}
                          </div>
                          <div className={cs(styles.statusBox, { [styles.active]: status === 'pending_approval' })}>
                            {I18n.t('idp.pdf.statuses.pending_approval')}
                          </div>
                          <div className={cs(styles.statusBox, { [styles.active]: status === 'approved' })}>
                            {I18n.t('idp.pdf.statuses.approved')}
                          </div>
                          <div className={cs(styles.statusBox, { [styles.active]: status === 'completed' })}>
                            {I18n.t('idp.pdf.statuses.completed')}
                          </div>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex vertical ref={container} gap={20} style={{ height: CONTAINER_HEIGHT }}>
                    {selectedSkills.map((skill, i) => (
                      <Skill key={i} skill={skill} developmentActions={skill.user_idp_development_actions} />
                    ))}
                  </Flex>
                </Flex>
              </Flex>
            </div>
          </Page>
        )
      })}
    </>
  )
}

export default Technical

import { useRef } from 'react'
import { Flex } from 'antd'
import cs from 'classnames'
import _ from 'lodash'
import styles from './IDP.less'
import Page from '../../Page'
import behaviorIcon from '../../../assets/Behaviour.svg'
import { Skill } from './DevelopmentAction'
import { useI18n } from '~/modules/idpReport/I18nContext'
import { useSkillPagination, getPaginatedSkills, Pagination } from './useSkillPagination'

const { I18n } = window
I18n.locale = document.body.getAttribute('data-locale')

const CONTAINER_HEIGHT = 630

const Behavioural = ({ skills, rtl, status }) => {
  const I18n = useI18n()
  const container = useRef<HTMLElement>(null)


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
                      <img src={behaviorIcon} className={styles.icon} />
                      <Flex vertical justify="space-between">
                        <h1 className={styles.title}>
                          {I18n.t('idp.pdf.idp.title')}
                        </h1>
                        <div className={styles.subtitle}>
                          {I18n.t('idp.pdf.idp.subtitle.behavioural')}
                        </div>
                      </Flex>
                    </Flex>
                    <Flex>
                      <Flex vertical gap={8}>
                        <Flex gap={16} align="center">
                          {I18n.t('idp.status')}
                          <div className={cs(styles.statusBox, styles.active)}>
                            {I18n.t(`idp.pdf.statuses.${status}`)}
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

export default Behavioural

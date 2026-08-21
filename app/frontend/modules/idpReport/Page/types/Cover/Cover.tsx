import React from 'react'
import { Flex } from 'antd'
import cs from 'classnames'
import bg from '../../../assets/MainBackground.png'
import Page from '../../Page'
import styles from './Cover.less'
import { useTemplate, useUserIdp } from '~/modules/idpReport/hooks/useIdpData'
import { usePageFontStyles } from '~/modules/idpReport/hooks/usePageFontStyles'
import { useI18n } from '~/modules/idpReport/I18nContext'
import { wordmarkWhiteUrl } from '~/utils/branding'

const FIELDS = [
  'name',
  'current_job_role',
  'target_job_role',
  'assigned_date',
  'division',
  'approval_date',
  'publish_date',
  'completion_date',
]

const FIELD_TO_DATA = {
  name: 'name',
  current_job_role: 'current_job_role',
  target_job_role: 'target_job_role',
  division: 'division',
  assigned_date: 'assigned_date',
  publish_date: 'start_date',
  completion_date: 'completed_date',
  approval_date: 'approval_date',
}

const Cover = ({ rtl }) => {
  const template = useTemplate()
  const userIdp = useUserIdp()
  const I18n = useI18n()
  const {
    background, client_logo, logo_type, title_text, subtitle_text,
  } = template

  const { titleStyle, subtitleStyle, bodyStyle } = usePageFontStyles('cover')

  const shouldFlip = template.flip_background ?? rtl

  const fieldsToRender = FIELDS.filter(field => template.fields.includes(field))

  const columns: string[][] = Array(4).fill('').map(() => [])
  fieldsToRender.forEach((field, index) => {
    const columnIndex = index < 4 ? index : index - 4
    columns[columnIndex].push(field)
  })

  return (
    <Page rtl={rtl}>
      <div className={cs(styles.content)}>
        <div
          className={cs(styles.background, { [styles.flipped]: shouldFlip })}
          style={{ backgroundImage: `url(${background || bg})` }}
        />
        {(logo_type === 'both' || logo_type === 'mercer_only') && (
          <div className={styles.mercerLogo}>
            <img src={wordmarkWhiteUrl()} />
          </div>
        )}
        {client_logo && (logo_type === 'both' || logo_type === 'client_only') && (
          <div className={styles.clientLogo}>
            <img src={client_logo} />
          </div>
        )}
        <Flex className={styles.main} justify="center" vertical style={{ height: '100%' }}>
          <h1 className={styles.title} style={titleStyle}>
            {title_text || (
              <>
                Individual
                {' '}
                <br />
                Development Plan
              </>
            )}
          </h1>
          <h2 className={styles.subtitle} style={subtitleStyle}>
            {subtitle_text}
          </h2>
        </Flex>

        <div className={styles.bottom}>
          <Flex flex={1}>
            {columns.map((column, index) => (
              <React.Fragment key={index}>
                <div className={styles.col}>
                  {column.map(item => (
                    <div className={styles.item} key={item}>
                      <div className={styles.label} style={bodyStyle}>
                        {I18n.t(`idp.pdf.cover.fields.${item}`)}
                      </div>
                      <div className={styles.value} style={bodyStyle}>
                        {userIdp[FIELD_TO_DATA[item]] || ''}
                      </div>
                    </div>
                  ))}
                </div>
                {column.length > 0 && index !== 3 && <div className={styles.divider} />}
              </React.Fragment>
            ))}
          </Flex>
        </div>
      </div>
    </Page>
  )
}

export default Cover

import React from 'react'
import { Flex } from 'antd'
import cs from 'classnames'
import bg from '../../../assets/MainBackground.png'
import mercer from '../../../assets/MercerLogo.svg'
import Page from '../../Page'
import styles from './Cover.less'
import { useAppSelector } from '~/modules/idpReport/hooks/redux'
import { useI18n } from '~/modules/idpReport/I18nContext'

const FIELDS = [
  'name',
  'role',
  'assigned_date',
  'division',
  'review_date',
  'publish_date',
  'completion_date',
]

const FIELD_TO_DATA = {
  name: 'name',
  role: 'role',
  division: 'division',
  assigned_date: 'assigned_date',
  publish_date: 'start_date',
  completion_date: 'completion_date',
}

const Cover = ({ rtl }) => {
  const template = useAppSelector(state => state.idp.template)
  const userIdp = useAppSelector(state => state.idp.userIdp)
  const I18n = useI18n()
  const {
    background, client_logo, logo_type, title_text, subtitle_text,
  } = template

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
          className={cs(styles.background, { [styles.flipped]: rtl })}
          style={{ backgroundImage: `url(${background || bg})` }}
        />
        {(logo_type === 'both' || logo_type === 'mercer_only') && (
          <div className={styles.mercerLogo}>
            <img src={mercer} />
          </div>
        )}
        {client_logo && (logo_type === 'both' || logo_type === 'client_only') && (
          <div className={styles.clientLogo}>
            <img src={client_logo} />
          </div>
        )}
        <Flex className={styles.main} justify="center" vertical style={{ height: '100%' }}>
          <h1 className={styles.title}>
            {title_text || (
              <>
                Individual
                {' '}
                <br />
                Development Plan
              </>
            )}
          </h1>
          <h2 className={styles.subtitle}>
            {subtitle_text || '(all levels - for succession projects only)'}
          </h2>
        </Flex>

        <div className={styles.bottom}>
          <Flex flex={1}>
            {columns.map((column, index) => (
              <React.Fragment key={index}>
                <div className={styles.col}>
                  {column.map(item => (
                    <div className={styles.item} key={item}>
                      <div className={styles.label}>
                        {I18n.t(`idp.pdf.cover.fields.${item}`)}
                      </div>
                      <div className={styles.value}>
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

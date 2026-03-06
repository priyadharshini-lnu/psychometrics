import { Flex } from 'antd'
import cs from 'classnames'
import bg from '../../../assets/MainBackground.png'
import mercer from '../../../assets/MercerLogo.svg'
import styles from './Last.less'
import Page from '../../Page'
import { useAppSelector } from '~/modules/idpReport/hooks/redux'
import { useI18n } from '~/modules/idpReport/I18nContext'


const Last = ({ rtl }) => {
  const template = useAppSelector(state => state.idp.template)
  const { background, client_logo, logo_type } = template
  const I18n = useI18n()

  return (
    <Page rtl={rtl}>
      <div className={cs(styles.content)}>
        <div
          className={cs(styles.background)}
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
        <Flex justify="center" vertical style={{ height: '100%' }}>
          <h1 className={styles.title}>
            {I18n.t('idp.pdf.last.end_report')}
          </h1>
        </Flex>
      </div>
    </Page>
  )
}

export default Last

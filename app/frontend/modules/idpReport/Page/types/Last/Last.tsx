import { Flex } from 'antd'
import cs from 'classnames'
import bg from '../../../assets/MainBackground.png'
import styles from './Last.less'
import Page from '../../Page'
import { useTemplate } from '~/modules/idpReport/hooks/useIdpData'
import { usePageFontStyles } from '~/modules/idpReport/hooks/usePageFontStyles'
import { useI18n } from '~/modules/idpReport/I18nContext'
import { wordmarkWhiteUrl } from '~/utils/branding'


const Last = ({ rtl }) => {
  const template = useTemplate()
  const { background, client_logo, logo_type } = template
  const I18n = useI18n()

  const { titleStyle } = usePageFontStyles('last')

  const shouldFlip = template.flip_background ?? rtl

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
        <Flex justify="center" vertical style={{ height: '100%' }}>
          <h1 className={styles.title} style={titleStyle}>
            {I18n.t('idp.pdf.last.end_report')}
          </h1>
        </Flex>
      </div>
    </Page>
  )
}

export default Last

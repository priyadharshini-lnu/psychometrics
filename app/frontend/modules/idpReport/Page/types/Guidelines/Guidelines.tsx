/* eslint-disable react/no-danger */
import { Flex } from 'antd'
import cs from 'classnames'
import _ from 'lodash'
import styles from './Guidelines.less'
import Page from '../../Page'
import { useI18n } from '~/modules/idpReport/I18nContext'


const Guidelines = ({ rtl }) => {
  const I18n = useI18n()
  return (
    <Page rtl={rtl}>
      <div className={cs(styles.content)}>
        <Flex vertical gap={16} style={{ height: '100%' }}>
          <h1 className={styles.header}>
            {I18n.t('idp.pdf.guidelines.title')}
          </h1>
          {/* <Flex>
            <div className={styles.card}>
              <div className={styles.title}>
                {I18n.t('idp.pdf.guidelines.cards.c1.title')}
              </div>
              <div className={styles.text}>
                <p>
                  {I18n.t('idp.pdf.guidelines.cards.c1.content')}
                </p>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.title}>
                {I18n.t('idp.pdf.guidelines.cards.c2.title')}
              </div>
              <div className={styles.text}>
                <p>
                  {I18n.t('idp.pdf.guidelines.cards.c2.content')}
                </p>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.title}>
                {I18n.t('idp.pdf.guidelines.cards.c3.title')}
              </div>
              <div className={styles.text}>
                <p>
                  {I18n.t('idp.pdf.guidelines.cards.c3.content')}
                </p>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.title}>
                {I18n.t('idp.pdf.guidelines.cards.c4.title')}
              </div>
              <div className={styles.text}>
                <p>{I18n.t('idp.pdf.guidelines.cards.c4.content')}</p>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.title}>
                {I18n.t('idp.pdf.guidelines.cards.c5.title')}
              </div>
              <div className={styles.text}>
                <p>{I18n.t('idp.pdf.guidelines.cards.c5.content')}</p>
              </div>
            </div>
          </Flex> */}
          <Flex>
            <div className={styles.text}>
              <p>{I18n.t('idp.pdf.guidelines.content.main')}</p>
              <ol className={styles.list}>
                <li>
                  <p>{I18n.t('idp.pdf.guidelines.content.list.r1')}</p>
                </li>
                <li>
                  <p>{I18n.t('idp.pdf.guidelines.content.list.r2')}</p>
                </li>
                <li>
                  <p>{I18n.t('idp.pdf.guidelines.content.list.r3')}</p>
                  <ol className={cs(styles.list, styles.nestedList)}>
                    <li>
                      <p>{I18n.t('idp.pdf.guidelines.content.list.r3a')}</p>
                    </li>
                    <li>
                      <p>{I18n.t('idp.pdf.guidelines.content.list.r3b')}</p>
                    </li>
                  </ol>
                </li>
              </ol>
            </div>
          </Flex>
          <Flex>
            <div className={styles.learnCard}>
              <div
                className={styles.title}
                dangerouslySetInnerHTML={{ __html: I18n.t('idp.pdf.guidelines.learn_cards.job.title') }}
              />
              <div className={styles.text}>
                <ol className={styles.list}>
                  {_.map(I18n.t('idp.pdf.guidelines.learn_cards.job.list'), (item, index) => (
                    <li key={index}><p>{item}</p></li>
                  ))}
                </ol>
              </div>
            </div>
            <div className={styles.learnCard}>
              <div
                className={styles.title}
                dangerouslySetInnerHTML={{ __html: I18n.t('idp.pdf.guidelines.learn_cards.collaboration.title') }}
              />
              <div className={styles.text}>
                <ol className={styles.list}>
                  {_.map(I18n.t('idp.pdf.guidelines.learn_cards.collaboration.list'), (item, index) => (
                    <li key={index}><p>{item}</p></li>
                  ))}
                </ol>
              </div>
            </div>
            <div className={styles.learnCard}>
              <div
                className={styles.title}
                dangerouslySetInnerHTML={{ __html: I18n.t('idp.pdf.guidelines.learn_cards.learn.title') }}
              />
              <div className={styles.text}>
                <ol className={styles.list}>
                  {_.map(I18n.t('idp.pdf.guidelines.learn_cards.learn.list'), (item, index) => (
                    <li key={index}><p>{item}</p></li>
                  ))}
                </ol>
              </div>
            </div>
          </Flex>
          {/* <div className={styles.graphic}>
            <div className={cs(styles.panel, styles.job)}>
              <div className={styles.cont}>
                <img className={styles.icon} src={jobIcon} />
                <div
                  className={styles.label}
                  dangerouslySetInnerHTML={{ __html: I18n.t('idp.pdf.guidelines.chart.job') }}
                />
              </div>
            </div>
            <div className={cs(styles.panel, styles.collaborative)}>
              <div className={styles.cont}>
                <img className={styles.icon} src={collaborativeIcon} />
                <div
                  className={styles.label}
                  dangerouslySetInnerHTML={{ __html: I18n.t('idp.pdf.guidelines.chart.collaboration') }}
                />
              </div>
            </div>
            <div className={cs(styles.panel, styles.learning)}>
              <div className={styles.cont}>
                <img className={styles.icon} src={learningIcon} />
                <div
                  className={styles.label}
                  dangerouslySetInnerHTML={{ __html: I18n.t('idp.pdf.guidelines.chart.learn') }}
                />
              </div>
            </div>
          </div> */}
        </Flex>

      </div>
    </Page>
  )
}

export default Guidelines

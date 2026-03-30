import { Flex } from 'antd'
import cs from 'classnames'
import { SafeHTML } from '~/components/SafeHTML'
import { useUserIdp } from '~/modules/idpReport/hooks/useIdpData'
import { usePageFontStyles } from '~/modules/idpReport/hooks/usePageFontStyles'
import styles from './Reflections.less'
import Page from '../../Page'
import { useI18n } from '~/modules/idpReport/I18nContext'


const Reflections = ({ rtl }) => {
  const I18n = useI18n()
  const { reflection_questions: reflectionQuestions } = useUserIdp()
  const {
    titleStyle, subtitleStyle, sectionTitleStyle, sectionBodyStyle,
  } = usePageFontStyles('reflections')
  if (!reflectionQuestions.length) { return null }

  return (
    <Page rtl={rtl}>
      <div className={cs(styles.content)}>
        <Flex vertical style={{ height: '100%' }} justify="space-between">
          <Flex gap={30} vertical flex={1}>
            <Flex className={styles.header} justify="space-between" align="center">
              <Flex gap={12}>
                <Flex vertical justify="space-between">
                  <h1 className={styles.title} style={titleStyle}>
                    {I18n.t('idp.pdf.reflections.title')}
                  </h1>
                  <div className={styles.subtitle} style={subtitleStyle}>
                    {I18n.t('idp.pdf.reflections.subtitle')}
                  </div>
                </Flex>
              </Flex>
            </Flex>
            <Flex flex={1} className={styles.reflections}>
              <Flex wrap="wrap" gap={20} align="flex-start">
                {reflectionQuestions.map(question => (
                  <Flex key={question.id} vertical className={styles.reflection} gap={12}>
                    <div className={styles.title} style={sectionTitleStyle}>
                      {question.question}
                    </div>
                    <div className={styles.text} style={sectionBodyStyle}>
                      <SafeHTML html={question.answer || ''} />
                    </div>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </div>
    </Page>
  )
}

export default Reflections

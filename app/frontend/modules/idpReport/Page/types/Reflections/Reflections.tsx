import { Flex } from 'antd'
import cs from 'classnames'
import { SafeHTML } from '~/components/SafeHTML'
import { useAppSelector } from '~/modules/idpReport/hooks/redux'
import styles from './Reflections.less'
import Page from '../../Page'

const { I18n } = window

const Reflections = ({ rtl }) => {
  const reflectionQuestions = useAppSelector(state => state.idp.userIdp.reflection_questions)
  const includeQuestions = window.location.search.includes('include_reflective_questions=true')
  if (!includeQuestions) { return null }

  return (
    <Page rtl={rtl}>
      <div className={cs(styles.content)}>
        <Flex vertical style={{ height: '100%' }} justify="space-between">
          <Flex gap={30} vertical flex={1}>
            <Flex className={styles.header} justify="space-between" align="center">
              <Flex gap={12}>
                <Flex vertical justify="space-between">
                  <h1 className={styles.title}>
                    {I18n.t('idp.pdf.reflections.title')}
                  </h1>
                  <div className={styles.subtitle}>
                    {I18n.t('idp.pdf.reflections.subtitle')}
                  </div>
                </Flex>
              </Flex>
            </Flex>
            <Flex flex={1} className={styles.reflections}>
              <Flex wrap="wrap" gap={20} align="flex-start">
                {reflectionQuestions.map(question => (
                  <Flex key={question.id} vertical className={styles.reflection} gap={12}>
                    <div className={styles.title}>
                      {question.question}
                    </div>
                    <div className={styles.text}>
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

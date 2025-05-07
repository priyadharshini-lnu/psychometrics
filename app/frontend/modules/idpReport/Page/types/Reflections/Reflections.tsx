import { Flex } from 'antd'
import cs from 'classnames'
import styles from './Reflections.less'
import Page from '../../Page'

const { I18n } = window

const Reflections = ({ rtl }) => (
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
              <Flex vertical className={styles.reflection} gap={12}>
                <div className={styles.title}>
                  What strengths do you want to continue to focus on?
                </div>
                <div className={styles.text}>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                  totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae
                  vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                  aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                  Neque porro quisquam est.
                </div>
              </Flex>
              <Flex vertical className={styles.reflection} gap={12}>
                <div className={styles.title}>
                  What strengths do you want to continue to focus on?
                </div>
                <div className={styles.text}>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                  totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae
                  vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                  aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                  Neque porro quisquam est.
                </div>
              </Flex>
              <Flex vertical className={styles.reflection} gap={12}>
                <div className={styles.title}>
                  What strengths do you want to continue to focus on?
                </div>
                <div className={styles.text}>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                </div>
              </Flex>
              <Flex vertical className={styles.reflection} gap={12}>
                <div className={styles.title}>
                  What strengths do you want to continue to focus on?
                </div>
                <div className={styles.text}>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                  totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae
                  vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                  aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                  Neque porro quisquam est.
                </div>
              </Flex>
              <Flex vertical className={styles.reflection} gap={12}>
                <div className={styles.title}>
                  What strengths do you want to continue to focus on?
                </div>
                <div className={styles.text}>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                  totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae
                  vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                  aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                  Neque porro quisquam est.
                </div>
              </Flex>
              <Flex vertical className={styles.reflection} gap={12}>
                <div className={styles.title}>
                  What strengths do you want to continue to focus on?
                </div>
                <div className={styles.text}>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                  totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae
                  vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                  aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                  Neque porro quisquam est.
                </div>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </div>
  </Page>
)

export default Reflections

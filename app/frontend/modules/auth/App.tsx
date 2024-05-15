import { ConfigProvider } from 'antd'
import { px2remTransformer, StyleProvider } from '@ant-design/cssinjs'
import { Locale } from 'antd/lib/locale'
import { ConnectedRouter } from 'connected-react-router'
import { DefaultAntThemeWrapper } from '~/glint'

import { AuthLayout } from './Layout'

const { antdLocale, I18n } = window
const px2rem = px2remTransformer({
  rootValue: 16,
})

export const App = ({ history }) => {
  const direction = I18n.currentLocale() === 'ar' ? 'rtl' : 'ltr'

  return (
    <DefaultAntThemeWrapper>
      <ConfigProvider locale={antdLocale as Locale} direction={direction}>
        <ConnectedRouter history={history}>
          <StyleProvider transformers={[px2rem]}>
            <AuthLayout />
          </StyleProvider>
        </ConnectedRouter>
      </ConfigProvider>
    </DefaultAntThemeWrapper>
  )
}

export default App

import { ConfigProvider } from 'antd'
import { px2remTransformer, StyleProvider } from '@ant-design/cssinjs'
import { Locale } from 'antd/lib/locale'
import { BrowserRouter as Router } from 'react-router-dom'
import '~/styles/utils.less'
import '~/styles/common.less'

import { AuthLayout } from './Layout'

const { antdLocale, I18n } = window
const px2rem = px2remTransformer({
  rootValue: 16,
})

export const App = () => {
  const direction = I18n.currentLocale() === 'ar' ? 'rtl' : 'ltr'

  return (
    <ConfigProvider locale={antdLocale as Locale} direction={direction}>
      <Router>
        <StyleProvider transformers={[px2rem]}>
          <AuthLayout />
        </StyleProvider>
      </Router>
    </ConfigProvider>
  )
}

export default App

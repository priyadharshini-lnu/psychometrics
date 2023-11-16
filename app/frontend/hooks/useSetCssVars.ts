import { theme } from 'antd'
import { generate } from '@ant-design/colors'
import { useEffect } from 'react'

const { useToken } = theme

type CssVar = {
  varName: string
  value: string
}

const addCssVars = (rootElement, cssVars: CssVar[]) => {
  cssVars.forEach(({ varName, value }) => {
    rootElement?.style.setProperty(varName, value)
  })
}

export const useSetCssVars = (cssVars?: CssVar[]) => {
  const { token } = useToken()
  const rootElement = document.querySelector('html')

  useEffect(() => {
    if (cssVars && cssVars.length) {
      addCssVars(rootElement, cssVars)
    } else {
      const {
        colorPrimary, colorWarning, colorError, colorPrimaryBg,
      } = token
      const colorPalette = generate(colorPrimary)
      const cssVarsFromToken = [
        { varName: '--ant-primary-color', value: colorPrimary },
        { varName: '--ant-primary-1', value: colorPalette[0] },
        { varName: '--ant-primary-7', value: colorPalette[6] },
        { varName: '--ant-warning-color', value: colorWarning },
        { varName: '--ant-error-color', value: colorError },
        { varName: '--ant-primary-color-outline', value: colorPrimaryBg },
      ]
      addCssVars(rootElement, cssVarsFromToken)
    }
  }, [])
}

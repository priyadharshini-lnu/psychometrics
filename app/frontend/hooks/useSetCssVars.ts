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
        colorPrimary, colorWarning, colorError, colorPrimaryBg, colorText, colorSuccess,
      } = token
      const colorPalette = generate(colorPrimary)
      const lightColorPalette = generate(colorPalette[0])
      const cssVarsFromToken = [
        { varName: '--ant-primary-color', value: colorPrimary },
        { varName: '--ant-primary-1', value: colorPalette[0] },
        { varName: '--ant-primary-3', value: colorPalette[2] },
        { varName: '--ant-primary-4', value: colorPalette[3] },
        { varName: '--ant-primary-7', value: colorPalette[6] },
        { varName: '--ant-primary-light-bg', value: lightColorPalette[0] },
        { varName: '--ant-warning-color', value: colorWarning },
        { varName: '--ant-error-color', value: colorError },
        { varName: '--ant-primary-color-outline', value: colorPrimaryBg },
        { varName: '--ant-text-color', value: colorText },
        { varName: '--ant-success-color', value: colorSuccess },
      ]
      const cssVarColors = [
        { varName: '--grey-text', value: '#757575' },
        { varName: '--bright-green-bg', value: '#038731' },
        { varName: '--green-bg', value: '#00807D' },
        { varName: '--light-green-bg', value: '#EDF5F5' },
        { varName: '--grey-border', value: '#8F8F8F' },
        { varName: '--light-grey-border', value: '#d9d9d9' },
        { varName: '--blue-bg', value: '#009de0' },
        { varName: '--shadow-color', value: 'rgba(0,0,0,0.08)' },
      ]
      addCssVars(rootElement, [...cssVarsFromToken, ...cssVarColors])
    }
  }, [])
}

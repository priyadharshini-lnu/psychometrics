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
        colorPrimary, colorWarning, colorError, colorPrimaryBg, colorText, colorSuccess, colorSuccessBg,
        colorBgContainerDisabled, colorWhite, colorSplit, colorTextSecondary, colorLink, colorLinkHover,
        colorBgElevated, colorFillQuaternary, colorPrimaryBorder, colorSuccessBgHover, colorSuccessBorder,
        colorErrorBg, colorErrorBgFilledHover, colorErrorBorder, controlTmpOutline,
      } = token
      const colorPalette = generate(colorPrimary)
      const cssVarsFromToken = [
        { varName: '--ant-primary-color', value: colorPrimary },
        // Both name the light brand surface; antd's generated shade grays out dark seeds like the Marsh navy.
        { varName: '--ant-primary-1', value: colorPrimaryBg },
        { varName: '--ant-primary-3', value: colorPalette[2] },
        { varName: '--ant-primary-4', value: colorPalette[3] },
        { varName: '--ant-primary-7', value: colorPalette[6] },
        { varName: '--ant-primary-light-bg', value: colorPrimaryBg },
        { varName: '--ant-warning-color', value: colorWarning },
        { varName: '--ant-error-color', value: colorError },
        { varName: '--ant-primary-color-outline', value: colorPrimaryBg },
        { varName: '--white-bg', value: colorWhite },
        { varName: '--ant-text-color', value: colorText },
        { varName: '--ant-success-color', value: colorSuccess },
        { varName: '--ant-success-color-bg', value: colorSuccessBg },
        { varName: '--ant-disabled-bg', value: colorBgContainerDisabled },
        // Referenced by stylesheets but never written before — rules using them fell back to inherit.
        { varName: '--ant-border-color-base', value: colorSplit },
        { varName: '--ant-text-color-secondary', value: colorTextSecondary },
        { varName: '--ant-link-color', value: colorLink },
        { varName: '--ant-link-hover-color', value: colorLinkHover },
        { varName: '--ant-component-background', value: colorBgElevated },
        { varName: '--ant-background-color-base', value: colorFillQuaternary },
        { varName: '--ant-danger-color', value: colorError },
        { varName: '--ant-control-tmp-outline', value: controlTmpOutline },
        // antd 6 cssVar-mode tokens only resolve inside component roots, so plain elements need these mirrors.
        { varName: '--ant-color-warning', value: colorWarning },
        { varName: '--ant-color-text-secondary', value: colorTextSecondary },
        { varName: '--ant-color-fill-quaternary', value: colorFillQuaternary },
        { varName: '--ant-color-primary-border', value: colorPrimaryBorder },
        { varName: '--ant-color-success-bg', value: colorSuccessBg },
        { varName: '--ant-color-success-bg-hover', value: colorSuccessBgHover },
        { varName: '--ant-color-success-border', value: colorSuccessBorder },
        { varName: '--ant-color-error-bg', value: colorErrorBg },
        { varName: '--ant-color-error-bg-filled-hover', value: colorErrorBgFilledHover },
        { varName: '--ant-color-error-border', value: colorErrorBorder },
      ]
      const cssVarColors = [
        { varName: '--brand-navy', value: '#061047' },
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
    // token mirrors the ACTIVE theme; an empty dep list froze the vars at first paint. Rewrites are idempotent.
  }, [token, cssVars, rootElement])
}

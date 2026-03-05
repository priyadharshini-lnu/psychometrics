import { useState, useEffect } from 'react'
import { UAParser } from 'ua-parser-js'

const isDesktopModeRenderedOnPhoneOrTablet = (parser: UAParser, device: UAParser.IDevice): boolean => {
  const os = parser.getOS()
  const osName = os?.name ?? ''
  const hasNoDeviceInfo = !device.type && !device.model && !device.vendor
  return osName === 'Linux' && hasNoDeviceInfo
}

export const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const detectDevice = async () => {
      const parser = new UAParser()
      const device = await parser.getDevice().withFeatureCheck()
      const type = device.type ?? ''
      const isMobileDevice = type === 'mobile'
        || type === 'tablet'
        || isDesktopModeRenderedOnPhoneOrTablet(parser, device)

      setIsMobile(isMobileDevice)
    }

    detectDevice()
  }, [])


  return { isMobileDevice: isMobile }
}

import { useContext } from 'react'
import { Flex, Typography } from 'antd'
import idpLibraryLogo from '~/modules/endUser/assets/images/IDP_library.svg'
import customDALogo from '~/modules/endUser/assets/images/custom_da.svg'
import generativeAILogo from '~/modules/endUser/assets/images/generative_ai.svg'
import { Separator } from '~/components/IdpShared/Separator'
import {
  MediaQueryContext,
} from '~/glint'

const { I18n } = window
export const DevelopmentActionInfoPopover = () => {
  const { isMobile } = useContext(MediaQueryContext)
  return (
    <Flex vertical={isMobile} gap={8} className="p-4">
      <Flex style={{ width: '250px' }} vertical gap={4} className={isMobile ? 'p-0' : 'fs-14'}>
        <strong>{I18n.t('idp.development_actions.create_my_own')}</strong>
        <Flex gap={4}>
          <img src={customDALogo} alt="Custom Development Action" />
          <Typography.Text>{I18n.t('idp.development_actions.custom')}</Typography.Text>
        </Flex>
        <Typography.Text type="secondary">
          {I18n.t('idp.development_actions.custom_da_description')}
        </Typography.Text>
      </Flex>
      <Separator type="vertical" style={{ height: 'auto' }} />
      <Flex style={{ width: '250px' }} vertical gap={4} className={isMobile ? 'p-0' : 'p-4 pt-0 ps-2 pe-2'}>
        <strong>{I18n.t('idp.development_actions.add_from_library')}</strong>
        <Flex gap={4}>
          <img src={idpLibraryLogo} alt="IDP Library" />
          <Typography.Text>{I18n.t('idp.development_actions.idp_library')}</Typography.Text>
        </Flex>
        <Typography.Text type="secondary">
          {I18n.t('idp.development_actions.idp_library_description')}
        </Typography.Text>
      </Flex>
      <Separator type="vertical" style={{ height: 'auto' }} />
      <Flex style={{ width: '250px' }} vertical gap={4} className={isMobile ? 'p-0' : 'p-4 pt-0 ps-2 pe-2'}>
        <strong>{I18n.t('idp.development_actions.create_from_ai')}</strong>
        <Flex gap={4}>
          <img src={generativeAILogo} alt="Generative AI" />
          <Typography.Text>{I18n.t('idp.development_actions.generative_ai')}</Typography.Text>
        </Flex>
        <Typography.Text type="secondary">
          {I18n.t('idp.development_actions.generative_ai_description')}
        </Typography.Text>
      </Flex>
    </Flex>
  )
}

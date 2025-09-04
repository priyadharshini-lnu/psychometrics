import { Flex, Typography } from 'antd'
import idpLibraryLogo from '~/modules/endUser/assets/images/IDP_library.svg'
import customDALogo from '~/modules/endUser/assets/images/custom_da.svg'
import generativeAILogo from '~/modules/endUser/assets/images/generative_ai.svg'


const { I18n } = window
export const DevelopmentActionInfoPopover = () => (
  <Flex gap={8}>
    <Flex vertical gap={4}>
      <Typography.Title
        level={3}
        className="mb-0 mt-0"
        style={{ color: 'var(--ant-primary-color)' }}
      >
        {I18n.t('idp.development_actions.one')}
      </Typography.Title>
      <strong>{I18n.t('idp.development_actions.create_my_own')}</strong>
      <Flex gap={4}>
        <img src={customDALogo} alt="Custom Development Action" />
        <Typography.Text>{I18n.t('idp.development_actions.custom')}</Typography.Text>
      </Flex>
    </Flex>
    <Flex vertical gap={4}>
      <Typography.Title
        level={3}
        className="mb-0 mt-0"
        style={{ color: 'var(--ant-primary-color)' }}
      >
        {I18n.t('idp.development_actions.two')}
      </Typography.Title>
      <strong>{I18n.t('idp.development_actions.add_from_library')}</strong>
      <Flex gap={4}>
        <img src={idpLibraryLogo} alt="IDP Library" />
        <Typography.Text>{I18n.t('idp.development_actions.idp_library')}</Typography.Text>
      </Flex>
    </Flex>
    <Flex vertical gap={4}>
      <Typography.Title
        level={3}
        className="mb-0 mt-0"
        style={{ color: 'var(--ant-primary-color)' }}
      >
        {I18n.t('idp.development_actions.three')}
      </Typography.Title>
      <strong>{I18n.t('idp.development_actions.create_from_ai')}</strong>
      <Flex gap={4}>
        <img src={generativeAILogo} alt="Generative AI" />
        <Typography.Text>{I18n.t('idp.development_actions.generative_ai')}</Typography.Text>
      </Flex>
    </Flex>
  </Flex>
)

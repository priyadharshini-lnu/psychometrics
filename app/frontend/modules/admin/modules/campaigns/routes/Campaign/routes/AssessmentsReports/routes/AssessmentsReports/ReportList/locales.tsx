import { Button, Flex, Popover } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { openModal } from '~/modules/admin/core/ui/modals'

const { I18n } = window

type Props = PropsFromRedux & {
  id: string,
  availableLanguages: string[],
  defaultLanguage: string,
  reportLocales: string[]
  campaignId: string,
  internal: boolean,
}

export const Locales = ({
  id, availableLanguages, defaultLanguage, reportLocales, openModal, campaignId, internal,
}: Props) => {
  const otherLanguages = availableLanguages?.filter(locale => locale !== defaultLanguage) || []
  const totalLanguages = (defaultLanguage ? 1 : 0) + otherLanguages.length

  const firstAdditionalLanguage = otherLanguages[0]
  const remainingCount = otherLanguages.length - 1

  const allLanguagesContent = (
    <Flex align="flex-end" gap={6} wrap style={{ maxWidth: '200px' }}>
      {defaultLanguage && (
        <Flex align="flex-end" gap={6}>
          <span style={{ fontWeight: 'bold' }}>
            {I18n.t(`languages.${defaultLanguage}`)}
          </span>
          <span style={{ fontStyle: 'italic' }}>
            (Default)
          </span>
          {otherLanguages.length ? <span>•</span> : null}
        </Flex>
      )}
      {otherLanguages.map((locale, i) => (
        <Flex align="center" gap={6}>
          <span>{I18n.t(`languages.${locale}`)}</span>
          {i < (otherLanguages.length - 1) ? <span> • </span> : null}
        </Flex>
      ))}
    </Flex>
  )

  return (
    <>
      {totalLanguages > 0 ? (
        <Popover content={allLanguagesContent}>
          <Flex gap={4} align="center" style={{ display: 'inline-flex' }}>
            {defaultLanguage && (
              <Flex gap={2}>
                <span>
                  {defaultLanguage}
                </span>
              </Flex>
            )}
            {firstAdditionalLanguage ? (
              <Flex align="center" gap={4}>
                {defaultLanguage ? <span>•</span> : null}
                <span>
                  {firstAdditionalLanguage}
                </span>
              </Flex>
            ) : null}
            {remainingCount > 0 ? (
              <Flex align="center" gap={4}>
                <span>•</span>
                <span>{`+${remainingCount}`}</span>
              </Flex>
            ) : null}
            { (internal && reportLocales.length > 1) ? (
              <Button
                onClick={() => openModal('UpdateReportLanguagesModal', {
                  campaignId, id, defaultLanguage, availableLanguages, reportLocales,
                })}
                size="small"
                type="link"
                icon={<EditOutlined />}
              />
            ) : null}
          </Flex>
        </Popover>
      )
        : (
          <Button
            onClick={() => openModal('UpdateReportLanguagesModal', {
              campaignId, id, defaultLanguage, availableLanguages, reportLocales,
            })}
            type="link"
          >
            {I18n.t('frontend.manage')}
          </Button>
        )
      }
    </>
  )
}

const connector = connect(() => ({ }),
  {
    openModal,
  })

type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(Locales)

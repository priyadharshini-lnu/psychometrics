import { FC } from 'react'
import {
  Col, Row, Form, InputNumber, Card, Divider, Select, Space,
} from 'antd'
import type { GetRef } from 'antd'
import { ColorPicker } from '~/glint/components/ColorPicker/ColorPicker'
import {
  FONT_FAMILIES, PAGE_KEYS, PAGE_WIDTH, PREVIEW_SCALE,
} from './constants'
import PagePreview from './PagePreview'
import type { PreviewTemplate } from './PagePreview'

const { I18n } = window

type FormInstance = GetRef<typeof Form>

interface FontStyleFieldProps {
  label: string
  namePrefix: string[]
  form: FormInstance
}

const FontStyleField: FC<FontStyleFieldProps> = ({ label, namePrefix, form }) => (
  <Card size="small" title={label} style={{ marginBottom: 8 }}>
    <Form.Item
      name={[...namePrefix, 'fontFamily']}
      label={I18n.t('admin.idp_appearance_font_family')}
      style={{ marginBottom: 8 }}
    >
      <Select placeholder={I18n.t('admin.idp_appearance_select_font')} size="small">
        {FONT_FAMILIES.map(font => (
          <Select.Option key={font} value={font}>{font}</Select.Option>
        ))}
      </Select>
    </Form.Item>
    <Row gutter={12}>
      <Col span={12}>
        <Form.Item
          name={[...namePrefix, 'fontSize']}
          label={I18n.t('admin.idp_appearance_size')}
          style={{ marginBottom: 0 }}
          normalize={(val) => {
            if (typeof val === 'string') return parseFloat(val) || undefined
            return val
          }}
        >
          <Space.Compact style={{ width: '100%' }}>
            <InputNumber
              style={{ width: '100%' }}
              size="small"
              min={8}
              max={120}
            />
            <span style={{ padding: '0 8px', lineHeight: '24px' }}>px</span>
          </Space.Compact>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name={[...namePrefix, 'fontColor']}
          label={I18n.t('admin.idp_appearance_color')}
          style={{ marginBottom: 0 }}
        >
          <ColorPicker
            getValueInHexFormat
            onChange={(color) => {
              form.setFieldValue([...namePrefix, 'fontColor'], color as string)
            }}
          />
        </Form.Item>
      </Col>
    </Row>
  </Card>
)

interface PageFontSettingsProps {
  form: FormInstance
  previewTemplate: PreviewTemplate
}

const PageFontSettings: FC<PageFontSettingsProps> = ({ form, previewTemplate }) => (
  <Card title={I18n.t('admin.idp_appearance_per_page_font_settings')}>
    {PAGE_KEYS.map(({ key, label }) => (
      <div key={key}>
        <Divider titlePlacement="left">{label}</Divider>
        <div style={{ maxWidth: PAGE_WIDTH * PREVIEW_SCALE }}>
          <Row gutter={[8, 8]}>
            <Col span={8}>
              <FontStyleField
                label={I18n.t('admin.idp_appearance_title')}
                namePrefix={['pageStyles', key, 'title']}
                form={form}
              />
            </Col>
            {key !== 'last' && (
              <Col span={8}>
                <FontStyleField
                  label={I18n.t('admin.idp_appearance_subtitle')}
                  namePrefix={['pageStyles', key, 'subtitle']}
                  form={form}
                />
              </Col>
            )}
            {(key === 'reflections' || key === 'idp' || key === 'report_summary') ? (
              <>
                {(key === 'idp' || key === 'report_summary') && (
                  <Col span={8}>
                    <FontStyleField
                      label={I18n.t('admin.idp_appearance_body')}
                      namePrefix={['pageStyles', key, 'body']}
                      form={form}
                    />
                  </Col>
                )}
                <Col span={8}>
                  <FontStyleField
                    label={I18n.t('admin.idp_appearance_section_title')}
                    namePrefix={['pageStyles', key, 'sectionTitle']}
                    form={form}
                  />
                </Col>
                {(key === 'idp' || key === 'report_summary') && (
                  <Col span={8}>
                    <FontStyleField
                      label={I18n.t('admin.idp_appearance_section_subtitle')}
                      namePrefix={['pageStyles', key, 'sectionSubtitle']}
                      form={form}
                    />
                  </Col>
                )}
                <Col span={8}>
                  <FontStyleField
                    label={I18n.t('admin.idp_appearance_section_body')}
                    namePrefix={['pageStyles', key, 'sectionBody']}
                    form={form}
                  />
                </Col>
              </>
            ) : key !== 'last' && (
              <Col span={8}>
                <FontStyleField
                  label={I18n.t('admin.idp_appearance_body')}
                  namePrefix={['pageStyles', key, 'body']}
                  form={form}
                />
              </Col>
            )}
            <Col span={24}>
              <PagePreview pageKey={key} template={previewTemplate} />
            </Col>
          </Row>
        </div>
      </div>
    ))}
  </Card>
)

export default PageFontSettings

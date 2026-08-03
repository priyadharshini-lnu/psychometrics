import { FC, ReactNode, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { createSelector } from 'reselect'
import _ from 'lodash'
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  PageContainer,
  Progress,
  Row,
  Select,
  Typography,
  Upload,
  useApp,
  useDirection,
} from '@thetalententerprise/glint'
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
} from '@thetalententerprise/glint/icons'
import { CropImageModal } from '~/glint/components/CropImageModal'
import Utils from '~/modules/reports/utils/Utils'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { sync, get as getUser, uploadPhoto } from '~/core/currentUser'
import { fallbackAvatar } from '~/modules/endUser/pages/UserPage/avatar'
import { CustomField } from '~/modules/endUser/modules/campaigns/routes/Profile/fields/CustomField'
import { asString, asStringOrNumber } from '~/utils/narrow'
import { toProfileUser } from './mapProfile'

const { I18n } = window

const AVAILABLE_QUESTIONS: Record<string, string[]> = {
  MultipleChoice: ['SingleAnswer', 'MultipleAnswer', 'Dropdown'],
  TextEntry: ['SingleLine', 'Multiline', 'DateEntry'],
}

const isAvailable = ({ question }: { question: { type: string; props: { type: string } } }) => (
  AVAILABLE_QUESTIONS[question.type]?.includes(question.props.type)
)

const genderOptions = [
  { key: 'male', label: I18n.t('profile.male'), value: 'male' },
  { key: 'female', label: I18n.t('profile.female'), value: 'female' },
  { key: 'not_disclosed', label: I18n.t('profile.not_disclosed'), value: 'not_disclosed' },
]

const languageOptions = I18n.availableLocales.map((locale: string) => ({
  key: locale,
  label: <span lang={locale}>{I18n.t(`languages.${locale}`)}</span>,
  value: locale,
}))

const EMPTY = '—'

// A view-mode row: bold label over the value, GitHub-settings style.
const FieldRow: FC<{ label: ReactNode; value?: ReactNode }> = ({ label, value }) => (
  <Flex vertical gap={4}>
    <Typography.Text strong style={{ fontSize: 'var(--ant-font-size-sm)' }}>{label}</Typography.Text>
    <Typography.Text>{value == null || value === '' ? EMPTY : value}</Typography.Text>
  </Flex>
)

const rowsWithDividers = (rows: ReactNode[]): ReactNode => rows
  .filter(row => row != null)
  .map((row, index) => (

    <Flex vertical gap="middle" key={index}>
      {index > 0 ? <Divider style={{ margin: 0 }} /> : null}
      {row}
    </Flex>
  ))

type SectionErrors = Record<string, string[] | string | undefined>

// The pencil that flips a card into its edit state.
const EditToggle: FC<{ onClick: () => void }> = ({ onClick }) => (
  <Button
    variant="outlined"
    scheme="default"
    icon={<EditOutlined />}
    aria-label={I18n.t('enduser.profile_edit')}
    onClick={onClick}
  />
)

// Save/Cancel row shared by the editable cards (Folio: gold CTA, arrow at the end).
const EditActions: FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const forwardIcon = useDirection() === 'rtl' ? <ArrowLeftOutlined /> : <ArrowRightOutlined />
  return (
    <Flex justify="flex-end" gap="small">
      <Button onClick={onCancel}>{I18n.t('enduser.profile_cancel')}</Button>
      <Button scheme="primary" variant="solid" htmlType="submit" icon={forwardIcon} iconPlacement="end">
        {I18n.t('enduser.profile_save')}
      </Button>
    </Flex>
  )
}

// Memoised so the derived user keeps a stable identity between store updates.
const selectUser = createSelector(getUser, toProfileUser)

const connector = connect((state: RootState) => ({
  user: selectUser(state),
  fields: state.config.profile.fields ?? [],
  lockedFields: state.config.profile.lockedFields,
  requiredFields: state.config.profile.requiredFields,
  enabledFields: state.config.profile.enabledFields,
}), { sync, uploadPhoto })

type PropsFromRedux = ConnectedProps<typeof connector>

// Folio profile: completion banner, personal-information card and other-information
// card, each viewable and editable in place. Legacy data layer (sync/uploadPhoto).
export const ProfileContentComponent: FC<PropsFromRedux> = ({
  user, fields, lockedFields, requiredFields, enabledFields, sync, uploadPhoto,
}) => {
  const { message } = useApp()
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingOther, setEditingOther] = useState(false)
  const [errors, setErrors] = useState<SectionErrors>({})
  const [showCropper, setShowCropper] = useState(false)
  const [image, setImage] = useState<{ src: string; type?: string } | null>(null)
  const [personalForm] = Form.useForm()
  const [otherForm] = Form.useForm()

  const customFields: Record<string, unknown> = _.reduce(
    user.customFields,
    (res, field, id) => ({ ...res, [`field_${id}`]: field }),
    {},
  )

  const submit = (payload: object, done: () => void) => sync(payload)
    .then(({ response }: { response: { backUrl?: string } }) => {
      message.success(I18n.t('profile.success_update'), 5)
      setErrors({})
      done()
      if (response.backUrl) window.location.href = response.backUrl
    })
    .catch((errors: SectionErrors) => setErrors(errors))

  const submitPersonal = (values: object) => submit(
    { ...values, photo: user.photo },
    () => setEditingPersonal(false),
  )

  const submitOther = (values: Record<string, unknown>) => {
    const empty: Record<string, unknown> = {}
    const merged = _.reduce(values, (res, val, key) => {
      const match = key.match(/field_(\d+)/)
      return match ? { ...res, [match[1]]: val ?? customFields[key] } : res
    }, empty)
    return submit({ customFields: merged }, () => setEditingOther(false))
  }

  const onChangeFile = ({ file }: { file: unknown }) => {
    if (!(file instanceof Blob)) return
    setImage({ src: URL.createObjectURL(file), type: file.type })
    setShowCropper(true)
  }

  const uploadCropped = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const data = new FormData()
      data.append('photo', blob, 'file.jpg')
      uploadPhoto(data).then(() => setShowCropper(false))
    }, 'image/jpg')
  }

  const help = (key: string): { help?: string[] | string; validateStatus?: 'error' } => ({
    help: errors[key],
    validateStatus: errors[key] ? 'error' : undefined,
  })

  const genderLabel = genderOptions.find(o => o.value === user.gender)?.label
  const languageLabel = user.locale ? I18n.t(`languages.${user.locale}`) : undefined
  const availableFields = fields.filter(isAvailable)

  const customValue = (field: { question_id: number }): ReactNode => {
    const value = customFields[`field_${field.question_id}`]
    return Array.isArray(value) ? value.join(', ') : asStringOrNumber(value)
  }

  const personalView = (
    <Flex vertical gap="middle">
      <Flex align="center" gap="middle">
        <Avatar
          src={user.photo || fallbackAvatar(user.email || user.fullName || 'user')}
          size={56}
          shape="square"
          icon={<UserOutlined />}
          style={{ background: 'var(--ant-color-primary-bg)', flexShrink: 0 }}
        />
        <Flex vertical style={{ minInlineSize: 0 }}>
          <Typography.Text strong style={{ fontSize: 'var(--ant-font-size-lg)' }} ellipsis>
            {user.fullName}
          </Typography.Text>
          <Typography.Text type="secondary" ellipsis>{user.email}</Typography.Text>
        </Flex>
      </Flex>
      <Divider style={{ margin: 0 }} />
      {rowsWithDividers([
        <FieldRow label={I18n.t('profile.first_name')} value={user.firstName} />,
        <FieldRow label={I18n.t('profile.last_name')} value={user.lastName} />,
        <FieldRow label={I18n.t('profile.email')} value={user.email} />,
        enabledFields.age ? <FieldRow label={I18n.t('profile.age')} value={user.age} /> : null,
        enabledFields.gender ? <FieldRow label={I18n.t('profile.gender')} value={genderLabel} /> : null,
        <FieldRow label={I18n.t('profile.locale')} value={languageLabel} />,
      ])}
    </Flex>
  )

  const personalEdit = (
    <Form
      layout="vertical"
      form={personalForm}
      initialValues={user}
      onFinish={submitPersonal}
    >
      <Flex vertical gap="small">
        <Typography.Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>
          {I18n.t('profile.mandatory_fields')}
        </Typography.Text>
        {enabledFields.photo ? (
          <Upload
            listType="picture-card"
            accept=".jpg, .jpeg, |image/*"
            showUploadList={false}
            maxCount={1}
            onChange={onChangeFile}
            beforeUpload={() => false}
          >
            {user.photo
              ? (
                <img
                  src={user.photo}
                  alt=""
                  style={{ maxInlineSize: '100%', borderRadius: 'var(--ant-border-radius)' }}
                />
              )
              : (
                <Flex vertical align="center" gap={4}>
                  <PlusOutlined />
                  {I18n.t('profile.add_photo')}
                </Flex>
              )}
          </Upload>
        ) : null}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="firstName"
              label={I18n.t('profile.first_name')}
              {...help('first_name')}
              rules={[{ required: true, message: I18n.t('validations.required') }]}
            >
              <Input autoComplete="tte-profile-firstname" disabled={lockedFields.first_name} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="lastName"
              label={I18n.t('profile.last_name')}
              {...help('last_name')}
              rules={[{ required: true, message: I18n.t('validations.required') }]}
            >
              <Input autoComplete="tte-profile-lastname" disabled={lockedFields.last_name} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="email" label={I18n.t('profile.email')}>
          <Input disabled autoComplete="tte-profile-email" />
        </Form.Item>
        <Row gutter={16}>
          {enabledFields.age ? (
            <Col xs={24} md={12}>
              <Form.Item
                name="age"
                label={I18n.t('profile.age')}
                {...help('age')}
                rules={[
                  { pattern: /^\d*$/, message: I18n.t('common.validations.should_be_whole_number') },
                  { required: requiredFields.age, message: I18n.t('validations.required') },
                ]}
              >
                <InputNumber controls={false} disabled={lockedFields.age} style={{ inlineSize: '100%' }} />
              </Form.Item>
            </Col>
          ) : null}
          {enabledFields.gender ? (
            <Col xs={24} md={12}>
              <Form.Item
                name="gender"
                label={I18n.t('profile.gender')}
                rules={[{ required: requiredFields.gender, message: I18n.t('validations.required') }]}
              >
                <Select options={genderOptions} showSearch={false} virtual={false} disabled={lockedFields.gender} />
              </Form.Item>
            </Col>
          ) : null}
        </Row>
        <Form.Item
          name="locale"
          label={I18n.t('profile.locale')}
          {...help('locale')}
          rules={[{ required: requiredFields.locale, message: I18n.t('validations.required') }]}
        >
          <Select options={languageOptions} virtual={false} disabled={lockedFields.locale} />
        </Form.Item>
        <EditActions onCancel={() => setEditingPersonal(false)} />
      </Flex>
    </Form>
  )

  const otherView = rowsWithDividers(availableFields.map(field => (
    <FieldRow
      label={Utils.stripHTML(field.translations.questionText || field.question.props.questionText)}
      value={customValue(field)}
    />
  )))

  const otherEdit = (
    <Form layout="vertical" form={otherForm} onFinish={submitOther}>
      <Flex vertical gap="small">
        {availableFields.map(field => (
          <Form.Item
            key={field.question_id}
            name={`field_${field.question_id}`}
            label={Utils.stripHTML(field.translations.questionText || field.question.props.questionText)}
            {...help(field.name)}
            rules={[{ required: field.required, message: I18n.t('validations.required') }]}
          >
            <CustomField
              field={field}
              defaultValue={asString(customFields[`field_${field.question_id}`])}
            />
          </Form.Item>
        ))}
        <EditActions onCancel={() => setEditingOther(false)} />
      </Flex>
    </Form>
  )

  return (
    <>
      <title>{`${I18n.t('profile.title')} - ${I18n.t('frontend.lighthouse_app')}`}</title>
      <PageContainer>
        <Flex vertical gap="large">
          <Typography.Title level={1} style={{ margin: 0 }}>
            {I18n.t('profile.title')}
          </Typography.Title>

          {user.updateProfileRequired ? (
            <Card>
              <Flex align="center" gap="middle">
                <Progress
                  type="circle"
                  size={56}
                  percent={user.profileCompletionPercentage}
                  aria-label={I18n.t('profile.update_required')}
                />
                <Flex vertical>
                  <Typography.Text strong>{I18n.t('profile.update_required')}</Typography.Text>
                  <Typography.Text type="secondary">{user.updateProfileMessage}</Typography.Text>
                </Flex>
              </Flex>
            </Card>
          ) : null}

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card
                title={I18n.t('enduser.profile_personal_information')}
                extra={editingPersonal ? undefined : <EditToggle onClick={() => setEditingPersonal(true)} />}
              >
                {editingPersonal ? personalEdit : personalView}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Flex vertical gap="large">
                {user.timezone ? (
                  <Card title={I18n.t('enduser.profile_time')}>
                    <FieldRow label={I18n.t('profile.timezone')} value={user.timezone} />
                  </Card>
                ) : null}
                {availableFields.length ? (
                  <Card
                    title={I18n.t('enduser.profile_other_information')}
                    extra={editingOther ? undefined : <EditToggle onClick={() => setEditingOther(true)} />}
                  >
                    {editingOther ? otherEdit : otherView}
                  </Card>
                ) : null}
              </Flex>
            </Col>
          </Row>
        </Flex>
      </PageContainer>
      <CropImageModal
        show={showCropper}
        onCrop={uploadCropped}
        onCancel={() => setShowCropper(false)}
        image={image}
        showControls
      />
    </>
  )
}

export const ProfileContent = connector(ProfileContentComponent)

export default ProfileContent

import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import {
  Avatar, Button, Card, Col, Divider, Flex, Form, Input, Row, Select, Typography, Upload,
  useApp, useGlintToken,
} from '@thetalententerprise/glint'
import type { UploadChangeParam } from '@thetalententerprise/glint'
import { PlusOutlined } from '@thetalententerprise/glint/icons'
import { useResources } from '~/hooks/useResources'
import { camelizeKeys } from '~/utils/object'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  get as getCurrentUser, uploadAdminUserPhoto,
} from '~/core/currentUser'
import { CropImageModal } from '~/glint/components/CropImageModal'
import { UserTR, User, UserProfile } from '~/modules/admin/modules/client/core/users'
import { useTimezones } from '~/hooks/useTimezones'

const { I18n } = window

interface Image {
  type?: string
  src: string
}

interface JSONApiError {
  title: string
  detail?: string
}

interface Errors {
  firstName?: JSONApiError
  lastName?: JSONApiError
  locale?: JSONApiError
  timezone?: JSONApiError
}


interface AdminUser extends User{
  userProfileData: UserProfile,
  userProfile: UserProfile,
}

function Profile ({
  currentUser, uploadPhoto, locales,
}) {
  useEffect(() => {
    fetchSingle({ id: currentUser.id })
  }, [currentUser.id])

  const [showCropper, setShowCropper] = useState(false)
  const [image, setImage] = useState<Image | null>(null)
  const { message } = useApp()
  const { controlHeightLG } = useGlintToken()
  const timezoneOptions = useTimezones()

  const {
    fetchSingle, getResource, updateResource, isLoading,
  } = useResources<AdminUser>('users', {
    responseType: UserTR,
    apiConfig: {
      camelizeExcept: ['$[*].enable_2fa', '$.enable_2fa'],
      include_resource_meta: ['permissions'],
      include: ['user_profile'],
    },
  })
  const profileUpdateInProgress = isLoading(`update@${currentUser.id}`)

  const [errors, setErrors] = useState<Errors | null>(null)

  const user = getResource(currentUser.id.toString())
  if (!user) return null
  const uploadFile = (canvas) => {
    if (canvas) {
      const form = new FormData()
      canvas.toBlob((blob) => {
        if (blob) {
          form.append('photo', blob, 'file.jpg')
          uploadPhoto(form).then(() => {
            setShowCropper(false)
          }).then(() => {
            fetchSingle({ id: currentUser.id })
          })
        }
      }, 'image/jpg')
    }
  }

  const submitForm = (values) => {
    updateResource({
      id: currentUser.id,
      firstName: values.firstName,
      lastName: values.lastName,
      userProfileData: {
        locale: values.locale,
        timezone: values.timezone,
      },
    }).then(() => {
      message.success(I18n.t('profile.success_update'), 5)
    }).catch((e) => {
      setErrors(e.errors || e)
    })
  }

  const onChangeFile = ({ file }: UploadChangeParam) => {
    if (!(file instanceof Blob)) return

    setImage({
      src: URL.createObjectURL(file),
      type: file.type,
    })
    setShowCropper(true)
  }

  const localeOptions = locales.map((locale: string) => ({
    value: locale,
    label: I18n.t(`languages.${locale}`),
  }))

  return (
    <>
      <Card>
        <Flex align="center" gap="middle">
          {/* The dashed ring stays visible around the inset avatar, so hover still reads as "change photo". */}
          <Upload
            listType="picture-circle"
            accept=".jpg, .jpeg, |image/*"
            showUploadList={false}
            maxCount={1}
            onChange={onChangeFile}
            beforeUpload={() => false}
          >
            {user.photoUrl ? (
              <Avatar
                src={user.photoUrl}
                size={controlHeightLG * 2}
                alt={I18n.t('profile.change_photo')}
              />
            ) : (
              <Flex vertical align="center" gap="small">
                <PlusOutlined />
                <Typography.Text>{I18n.t('profile.add_photo')}</Typography.Text>
              </Flex>
            )}
          </Upload>
          <Flex vertical>
            <Typography.Text strong ellipsis>{user.fullName}</Typography.Text>
            <Typography.Text type="secondary" ellipsis>{user.email}</Typography.Text>
          </Flex>
        </Flex>
        <Divider />
        <Form
          layout="vertical"
          initialValues={{
            firstName: user.firstName,
            lastName: user.lastName,
            locale: user.userProfile?.locale,
            timezone: user.userProfile?.timezone,
            email: user.email,
          }}
          onFinish={submitForm}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="firstName"
                label={I18n.t('shared.first_name')}
                hasFeedback
                help={errors?.firstName?.title}
                validateStatus={errors?.firstName ? 'error' : ''}
                required
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="lastName"
                label={I18n.t('shared.last_name')}
                hasFeedback
                help={errors?.lastName?.title}
                validateStatus={errors?.lastName ? 'error' : ''}
                required
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="email" label={I18n.t('shared.email')}>
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="locale"
            label={I18n.t('profile.locale')}
            hasFeedback
            help={errors?.locale?.title}
            validateStatus={errors?.locale ? 'error' : ''}
          >
            {/* Searching languages matches the translated name, not the locale code. */}
            <Select options={localeOptions} showSearch={{ optionFilterProp: 'label' }} />
          </Form.Item>
          <Form.Item
            name="timezone"
            label={I18n.t('profile.timezone')}
            hasFeedback
            help={errors?.timezone?.title}
            validateStatus={errors?.timezone ? 'error' : ''}
          >
            <Select options={timezoneOptions} showSearch />
          </Form.Item>
          <Flex justify="end">
            <Button type="primary" htmlType="submit" loading={profileUpdateInProgress}>
              {I18n.t('shared.update')}
            </Button>
          </Flex>
        </Form>
      </Card>
      <CropImageModal
        show={showCropper}
        onCrop={uploadFile}
        onCancel={() => setShowCropper(false)}
        image={image}
      />
    </>
  )
}

const connector = connect((state: RootState) => ({
  currentUser: camelizeKeys(getCurrentUser(state)),
  locales: state.config.availableLocales,
}), {
  uploadPhoto: uploadAdminUserPhoto,
})

export default connector(Profile)

import React, { useEffect, useCallback } from 'react'
import {
  Form, Input, Select, Spin, Upload, Button, DatePicker, Flex, Switch,
} from 'antd'
import { useParams } from 'react-router'
import { DevelopmentAction } from 'modules/admin/modules/client/core/developmentAction'
import { Client } from 'modules/admin/modules/client/core/clients'
import { debounce, uniqBy } from 'lodash'
import dayjs from 'dayjs'
import { useDispatch } from 'react-redux'
import { UploadFile } from 'antd/es/upload/interface'
import { Tag } from 'modules/admin/core/tags'
import { UploadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Skill, SkillTR } from '~/modules/admin/modules/client/core/skills'
import { Project } from '~/modules/admin/modules/client/core/projects'
import { useResources } from '~/hooks/useResources'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'
import { getFormDataForFiles } from '~/utils/formData'
import {
  uploadFiles,
  DevelopmentActionType,
  DevelopmentActionLearningStyle,
} from '~/modules/admin/modules/client/core/developmentAction'
import InputDuration from '~/components/InputDuration'
import { durationValidator } from '~/components/DurationValidator'
import { TaggableResourceType } from '~/modules/admin/components/Resource/TagFilter/constants'


const { Option } = Select

const MAX_TAG_BATCH_SIZE = 100

type OptionsType = {
  id: string
  name: string
}

type Props = {
  close(): void
  developmentAction?: DevelopmentAction
}

type ImageFile = {
  file: File | UploadFile
  fileList: File | UploadFile[]
}

const { I18n } = window

export const DevelopmentActionsFormModal: React.FC<Props> = ({ close, developmentAction }) => {
  const { resource } = useResourceContext<DevelopmentAction>()
  const dispatch = useDispatch()

  const { availableLocales } = I18n

  const { projectId: projectIdParam } = useParams()

  const [form] = Form.useForm()
  const {
    data: owners, fetch: fetchOwners, isLoading: isOwnerLoading,
  } = useResources<Client>('clients')
  const {
    data: skillsData,
    fetch: fetchSkills,
    isLoading: isSkillsLoading,
    setData: setSkills,
  } = useResources<Skill>('skills', {
    trackUrl: false,
    responseType: SkillTR,
    apiConfig: {
      include: ['project'],
      fields: { skills: ['name'] },
    },
  })

  const {
    data: tags, fetch: fetchTags, isLoading: isTagsLoading,
  } = useResources<Tag>('tags', {
    apiConfig: {
      query: { taggable_resource_type: TaggableResourceType.DevelopmentAction },
    },
  })

  const ownerOption = Form.useWatch('ownerId', form)

  const projectId = Form.useWatch('projectId', form)

  const courseStartDate = Form.useWatch('course_start_date', form)

  const courseEndDate = Form.useWatch('course_end_date', form)

  useEffect(() => {
    if (courseStartDate) {
      if (!courseEndDate) form.setFieldsValue({ course_end_date: courseStartDate })
      else if (courseEndDate.isBefore(courseStartDate, 'day')) form.setFieldsValue({ course_end_date: courseStartDate })
    }
  }, [courseStartDate])

  const {
    data: projects, fetch: fetchProjects, isLoading: projectIsLoading, setData: setProjects,
  } = useResources<Project>('projects', { basePath: `clients/${ownerOption}` })

  const ownersLoading = isOwnerLoading('fetch')

  const fetchOwnersByValue = (value: string) => fetchOwners({
    apiConfig: {
      filter: {
        filterable_fields: value,
      },
    },
  })

  const searchAvailableOwners = debounce((value) => {
    fetchOwnersByValue(value)
  }, 50)

  const searchAvailableSkills = debounce((value) => {
    setSkills([])

    let projectIdFilter = ''
    if (!developmentAction) {
      if (global) {
        projectIdFilter = ''
      } else {
        projectIdFilter = projectId
      }
    } else if (developmentAction.project) {
      projectIdFilter = developmentAction?.project.id
    } else {
      projectIdFilter = ''
    }

    fetchSkills({
      apiConfig: {
        filter: {
          name_cont: value,
          project_id_eq: projectIdParam || projectIdFilter,
          ...(!projectIdParam && !projectIdFilter && { global }),
        },
        fields: { skills: ['name'] },
        include: ['project'],
      },
    })
  }, 300)

  const debouncedFetchTags = useCallback(debounce((value) => {
    fetchTags({
      apiConfig: {
        filter: { name_cont: value },
        fields: { tags: ['name'] },
        page: {
          size: MAX_TAG_BATCH_SIZE,
        },
      },
    })
  }, 300), [])

  const developmentActionType = Form.useWatch('developmentActionType', form)

  const imageField = Form.useWatch('image', form)

  const global = Form.useWatch('global', form)

  useEffect(() => {
    setProjects([])
    form.resetFields(['projectId'])
  }, [ownerOption])

  useEffect(() => {
    form.resetFields(['ownerId', 'projectId', 'skillIds'])
    setSkills([])
  }, [global])

  useEffect(() => {
    if (!developmentAction) {
      setSkills([])
      form.resetFields(['skillIds'])
    }
  }, [projectId])

  const getProjects = (): OptionsType[] => {
    if (!developmentAction || !developmentAction.project) {
      return projects
    }

    return [...projects, developmentAction.project] as OptionsType[]
  }

  const createDevelopmentAction = (data: Omit<DevelopmentAction, 'image'>
    & {ownerId?: string, image: ImageFile | null, global?: boolean}) => {
    if (data.ownerId) {
      delete data.ownerId
    }

    // eslint-disable-next-line no-prototype-builtins
    if (data.hasOwnProperty('global')) {
      delete data.global
    }

    if (projectIdParam) {
      data.project = { id: projectIdParam } as {id: string}
    }

    const { image, ...dataWithoutImage } = data
    return resource.createResource(dataWithoutImage as DevelopmentAction)
      .then((res) => {
        if (image && image.fileList.length) {
          const formData = getFormDataForFiles<{image: ImageFile}>({ image }, ['image'])
          return dispatch(uploadFiles(res.id, formData as FormData))
        }
        return null
      }).then(() => {
        resource.fetch()
      })
  }

  const updateDevelopmentAction = (data: DevelopmentAction & {ownerId?: string}) => {
    if (data.ownerId) {
      delete data.ownerId
    }

    if (projectIdParam) {
      data.project = {
        id: projectIdParam,
      }
    }

    const { image, ...dataWithoutImage } = data
    return resource.updateResource({
      ...dataWithoutImage,
      courseStartDate: dayjs(courseStartDate).format('YYYY-MM-DD'),
      courseEndDate: dayjs(courseEndDate).format('YYYY-MM-DD'),
    })
      .then((res) => {
        if (image && typeof image !== 'string' && (image as ImageFile).fileList.length) {
          const formData = getFormDataForFiles<{image: ImageFile}>({ image }, ['image'])
          return dispatch(uploadFiles(res.id, formData as FormData))
        }
        return null
      }).then(() => {
        resource.fetch()
      })
  }

  const handleProjectSearch = (value: string) => {
    fetchProjects({
      apiConfig: {
        filter: { filterable_fields: value },
        fields: { clients: ['name'] },
      },
    })
  }

  const skills = developmentAction?.skills ? uniqBy(skillsData.concat(developmentAction.skills), 'id') : skillsData

  const renderClientSelector = () => {
    if (global) {
      return null
    }
    return (
      // if new DA and it is not global is being added
      <Form.Item
        name="ownerId"
        label={I18n.t('admin.client')}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select
          showSearch={{ filterOption: false, onSearch: searchAvailableOwners }}
          placeholder={I18n.t('admin.development_actions_form_client_placeholder')}
          notFoundContent={ownersLoading ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
        >
          {
            owners.map(({ id, name }) => (
              <Option key={id} value={id}>{name}</Option>
            ))
          }
        </Select>
      </Form.Item>
    )
  }

  const renderProjectSelector = () => {
    // if global DA, return null
    if (global) { return null }

    // if already existing DA and doesn't have project, return null
    if (developmentAction && !developmentAction?.project) { return null }

    return (
      <Form.Item
        name="projectId"
        label={I18n.t('admin.project')}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select
          showSearch={{ filterOption: false, onSearch: handleProjectSearch }}
          disabled={!!developmentAction}
          options={(getProjects() || []).map(p => ({
            value: p.id,
            label: p.name,
          }))}
          placeholder={I18n.t('admin.development_actions_form_project_placeholder')}
          value={form.getFieldValue('projectId')}
          notFoundContent={projectIsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
        />
      </Form.Item>
    )
  }

  return (
    <ResourceFormModal
      resourceName="development_actions"
      resource={developmentAction}
      readableResourceName={I18n.t('admin.development_actions_form_title')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: createDevelopmentAction, updateResource: updateDevelopmentAction }}
      formProps={{
        initialValues: {
          ...developmentAction,
          developmentActionType: developmentAction?.developmentActionType,
          learning_style: developmentAction?.learningStyle,
          course_url: developmentAction?.courseUrl ?? '',
          course_start_date: developmentAction?.courseStartDate ? dayjs(developmentAction.courseStartDate) : null,
          course_end_date: developmentAction?.courseEndDate ? dayjs(developmentAction.courseEndDate) : null,
          image: developmentAction?.image,
          availableLanguages: developmentAction?.availableLanguages || [],
          tagList: developmentAction?.tagList || [],
        },
      }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('shared.name')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={I18n.t('shared.description')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
          {!projectIdParam && (
            <>
              {!developmentAction && (
                <>
                  <Form.Item
                    name="global"
                    label={I18n.t('admin.development_actions_global')}
                  >
                    <Switch />
                  </Form.Item>
                  {renderClientSelector()}
                </>
              )}
              {renderProjectSelector()}
            </>
          )}
          <Form.Item
            name="developmentActionType"
            label={I18n.t('admin.development_actions_form_development_action_type')}
            rules={[
              { required: true },
            ]}
          >
            <Select>
              {
                Object.keys(DevelopmentActionType)
                  .map(developmentActionType => (
                    <Option key={developmentActionType} value={developmentActionType}>
                      {I18n.t(
                        `admin.${developmentActionType}`,
                      )}
                    </Option>
                  ))
              }
            </Select>
          </Form.Item>

          {
            developmentActionType === DevelopmentActionType.course
              ? (
                <>
                  <Form.Item name="image" label={I18n.t('admin.development_actions_form_course_image')}>
                    <Upload
                      listType="picture"
                      maxCount={1}
                      accept=".jpg, .png, .jpeg, |image/*"
                      fileList={imageField && typeof imageField === 'string' ? [{
                        uid: '1', name: 'image', status: 'done', url: imageField,
                      }] : undefined}
                      onRemove={() => {
                        form.setFieldsValue({
                          image: { fileList: [], status: 'removed' },
                          purge_image: '1',
                        })
                      }}
                      beforeUpload={() => false}
                    >
                      <Button disabled={imageField && imageField.fileList?.length !== 0} icon={<UploadOutlined />}>
                        {I18n.t('shared.upload')}
                      </Button>
                    </Upload>
                  </Form.Item>

                  <Form.Item
                    name="course_url"
                    label={I18n.t('admin.development_actions_form_course_link')}
                  >
                    <Input />
                  </Form.Item>
                  <Flex flex={1} gap={4}>
                    <Form.Item
                      name="course_start_date"
                      label={I18n.t('shared.start_date')}
                    >
                      <DatePicker
                        format="YYYY-MM-DD"
                        disabledDate={current => current && current < dayjs().startOf('day')}
                      />
                    </Form.Item>
                    <Form.Item
                      name="course_end_date"
                      label={I18n.t('shared.end_date')}
                    >
                      <DatePicker
                        format="YYYY-MM-DD"
                        disabledDate={current => (courseStartDate ? current
                          && current.isBefore(courseStartDate, 'day') : false)}
                      />
                    </Form.Item>
                  </Flex>
                  {
                    developmentActionType === DevelopmentActionType.course && (
                      <Form.Item
                        name="availableLanguages"
                        label={I18n.t('admin.development_actions_form_available_languages')}
                      >
                        <Select mode="multiple">
                          {availableLocales
                            .map(locale => (
                              <Select.Option key={locale} value={locale}>
                                {I18n.t(`languages.${locale}`)}
                              </Select.Option>
                            ))}
                        </Select>
                      </Form.Item>
                    )
                  }
                </>
              ) : null
          }
          <Form.Item
            name="learning_style"
            label={I18n.t('admin.development_actions_form_learning_style')}
            rules={[
              { required: true },
            ]}
          >
            <Select>
              {
                Object.keys(DevelopmentActionLearningStyle)
                  .map(style => (
                    <Option key={style} value={style}>
                      {I18n.t(
                        `admin.${style}`,
                      )}
                    </Option>
                  ))
              }
            </Select>
          </Form.Item>
          <Form.Item
            name="duration"
            label={I18n.t('admin.development_actions_form_duration')}
            rules={[
              {
                validator: durationValidator({
                  minMinutes: 1,
                  maxMinutes: 24 * 60 * 365,
                  minError: I18n.t('admin.development_actions_duration_min_length'),
                  maxError: I18n.t('admin.development_actions_duration_max_length'),
                  requiredError: '',
                  required: false,
                }),
              },
            ]}
          >
            <InputDuration
              value=""
              onChange={() => {}}
              placeholder={I18n.t('admin.components_input_duration_placeholder')}
            />
          </Form.Item>
          <Form.Item
            name="skillIds"
            label={I18n.t('admin.development_actions_form_skills')}
            rules={[{ required: true }]}
          >
            <Select
              showSearch={{ filterOption: false, onSearch: searchAvailableSkills }}
              placeholder={I18n.t('admin.development_actions_form_skills_placeholder')}
              mode="multiple"
              notFoundContent={isSkillsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
              defaultActiveFirstOption={false}
              maxTagCount="responsive"
              virtual={false}
              disabled={!projectIdParam && !global && (!developmentAction && !projectId)}
            >
              {skills.map(({ id, name }) => (
                <Option key={id} value={id}>{name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="tagList"
            label={I18n.t('shared.tags')}
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder={I18n.t('shared.tags')}
              showSearch={{ filterOption: false, onSearch: debouncedFetchTags }}
              notFoundContent={isTagsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
              maxTagCount="responsive"
            >
              {tags.map(({ name }) => (
                <Select.Option key={name} value={name}>{name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}

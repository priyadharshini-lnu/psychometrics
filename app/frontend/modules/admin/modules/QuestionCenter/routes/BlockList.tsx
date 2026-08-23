import React from 'react'
import {
  Button, Flex, message, Switch,
} from 'antd'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import dayjs from 'dayjs'
import {
  PlusOutlined, CopyOutlined, DeleteOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { ConfirmationModal } from '~/glint'
import { PlaceholderText } from '~/components/PlaceholderText'
import { Block, BlockTR } from '~/modules/admin/modules/QuestionCenter/core/blocks'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'
import { TABLE_SETTINGS_KEYS } from '~/modules/admin/components/Resource/settingsKeys'
import { openModal } from '~/modules/admin/core/ui/modals'
import Modals from '~/modules/admin/components/Modals/'
import CopyBlockFormModal from './CopyBlockFormModal'
import CreateBlockModal from './CreateBlockModal'

const { I18n } = window

const MODALS = {
  CopyBlockFormModal,
}

const ActiveSwitch = ({ block }: { block: Block }) => {
  const { resource } = useResourceContext<Block>()

  const onToggle = () => {
    resource.memberAction({
      id: block.id,
      action: 'toggle_status',
      method: 'post',
      updateStore: true,
      responseType: BlockTR,
    }).catch(() => {
      message.error(I18n.t('admin.errors_error_msg'))
    })
  }

  return (
    <Switch checked={!block.disabled} onChange={onToggle} />
  )
}

const ActionsCell = ({ record }: { record: Block }) => {
  const { resource } = useResourceContext()
  const dispatch = useDispatch()
  const [confirmation, setConfirmation] = React.useState(false)

  const handleDelete = () => {
    resource.removeResource(record.id).then(() => {
      message.success(I18n.t('shared.removed'))
      setConfirmation(false)
    })
  }

  const handleCopy = () => {
    dispatch(openModal('CopyBlockFormModal', { block: record }))
  }

  return (
    <>
      <Flex gap="small">
        <Button
          shape="circle"
          icon={<CopyOutlined />}
          onClick={handleCopy}
        />
        <Button
          shape="circle"
          icon={<DeleteOutlined />}
          onClick={() => setConfirmation(true)}
        />
      </Flex>
      <ConfirmationModal
        open={confirmation}
        title={I18n.t('admin.confirmation_required')}
        message={I18n.t('admin.confirmation_required_details', {
          resource: 'Block',
          resource_name: record.name,
        })}
        onConfirm={handleDelete}
        onCancel={(e) => {
          e.stopPropagation()
          setConfirmation(false)
        }}
        close={() => null}
      />
    </>
  )
}

const CreateBlockButton: React.FC = () => {
  const { resource } = useResourceContext<Block>()
  const [visible, setVisible] = React.useState(false)
  const [createdBlockId, setCreatedBlockId] = React.useState<string | null>(null)
  const redirectLinkRef = React.useRef<HTMLAnchorElement | null>(null)

  React.useEffect(() => {
    if (createdBlockId && redirectLinkRef.current) {
      redirectLinkRef.current.click()
    }
  }, [createdBlockId])

  const handleCreate = async (values: { name: string, ownerId?: string }) => {
    try {
      const data = {
        name: values.name,
        blockType: 'regular',
        position: 1,
        props: { randomization: { type: 'No' } },
        owner: values.ownerId ? { id: values.ownerId } : null,
      }

      const created = await resource.createResource(data as unknown as Block)
      message.success(I18n.t('shared.created_successfully'))
      setVisible(false)
      setCreatedBlockId(created.id)
    } catch (error) {
      console.error('Failed to create block:', error)
      message.error(I18n.t('shared.error'))
    }
  }

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setVisible(true)}
      >
        {I18n.t('admin.blocks_new_button')}
      </Button>
      <CreateBlockModal
        visible={visible}
        onCancel={() => setVisible(false)}
        onCreate={handleCreate}
      />
      {createdBlockId && (
        <Link
          to={`/administration/templates/blocks/${createdBlockId}/edit`}
          reloadDocument
          ref={redirectLinkRef}
          style={{ display: 'none' }}
        >
          {I18n.t('shared.view') || 'View'}
        </Link>
      )}
    </>
  )
}

const BlockList: React.FC = () => {
  const config = {
    trackUrl: true,
    responseType: BlockTR,
    apiConfig: {
      filter: { view_eq: 'templates' },
      include: ['owner', 'linked_assessments'],
    },
  }

  const Filter = (
    <Resource.Filter
      name="filterable_fields"
      placeholder={I18n.t('shared.search')}
    >
      <CreateBlockButton />
    </Resource.Filter>
  )

  const Table = (
    <Resource.Table pagination>
      <Resource.Column<Block>
        id="id"
        dataIndex="id"
        title={I18n.t('shared.id') || 'ID'}
        sorter
        fixed="left"
      />
      <Resource.Column<Block>
        id="active"
        title={I18n.t('shared.active')}
        render={block => <ActiveSwitch block={block} />}
        sorter
        fixed="left"
      />
      <Resource.Column<Block>
        id="name"
        hideable={false}
        dataIndex="name"
        title={I18n.t('shared.name')}
        sorter
        render={(name, record) => (
          <Link
            to={`/admin/templates/blocks/${record.id}/edit`}
            reloadDocument
          >
            {name}
          </Link>
        )}
      />
      <Resource.Column<Block>
        id="linked_assessments"
        width={350}
        title={I18n.t('admin.linked_assessments') || 'Linked Assessments'}
        render={(_, record) => {
          if (!record.linkedAssessments || record.linkedAssessments.length === 0) return ''
          return (
            <div>
              {record.linkedAssessments.map((assessment, index) => (
                <React.Fragment key={assessment.id}>
                  {index > 0 && ', '}
                  <Link to={`/admin/assessments/${assessment.id}/edit`}>
                    {assessment.name}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          )
        }}
      />
      <Resource.Column<Block>
        id="owner"
        title={I18n.t('shared.owner')}
        dataIndex={['owner', 'name']}
        render={(ownerName, record) => (record.owner ? (
          <Link to={`/admin/clients/${record.owner.id}`}>
            {ownerName}
          </Link>
        ) : <PlaceholderText>{I18n.t('admin.platform_owner')}</PlaceholderText>)}
      />
      <Resource.Column<Block>
        id="created_at"
        dataIndex="createdAt"
        title={I18n.t('shared.created_at')}
        render={createdAt => (
          dayjs(createdAt).format('lll')
        )}
        sorter
      />
      <Resource.Column<Block>
        id="actions"
        hideable={false}
        title={I18n.t('shared.actions')}
        render={(_, record) => <ActionsCell record={record} />}
        fixed="right"
      />
    </Resource.Table>
  )

  return (
    <Resource
      title={I18n.t('admin.blocks_title')}
      config={config}
      name="blocks"
      settingsKey={TABLE_SETTINGS_KEYS.adminQuestionCenterBlocks}
    >
      {Filter}
      {Table}
      <Modals modals={MODALS} />
    </Resource>
  )
}

export default BlockList

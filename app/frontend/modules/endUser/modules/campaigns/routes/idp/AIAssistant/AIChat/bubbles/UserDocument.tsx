import { Button, Space } from 'antd'
import {
  Attachments, Bubble,
} from '@ant-design/x'
import { CopyOutlined, EditOutlined } from '@ant-design/icons'

export const UserDocument = ({ message: { file } }) => (
  <Bubble
    placement="end"
    content={<Attachments.FileCard key={file.uid} item={file} />}
    footer={() => (
      <Space>
        <Button
          color="primary"
          variant="text"
          size="small"
          icon={<CopyOutlined />}
        />
        <Button color="primary" variant="text" size="small" icon={<EditOutlined />} />
      </Space>
    )}
  />
)

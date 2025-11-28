import {
  Attachments, Bubble,
} from '@ant-design/x'

export const UserDocument = ({ message: { file } }) => (
  <Bubble
    placement="end"
    content={<Attachments.FileCard key={file.uid} item={file} />}
  />
)

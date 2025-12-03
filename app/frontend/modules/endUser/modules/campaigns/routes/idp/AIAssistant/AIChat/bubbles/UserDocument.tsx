import { Attachments, Bubble } from '@ant-design/x'

export const UserDocument = ({ message }) => {
  const file = message?.file || {
    uid: message,
    name: message.replace(/^Uploaded file\s*/i, ''),
    status: 'done',
  }

  return (
    <Bubble
      placement="end"
      content={<Attachments.FileCard key={file.uid} item={file} />}
    />
  )
}

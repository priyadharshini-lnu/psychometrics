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
      content={(
        <Attachments
          styles={{ list: { padding: 0 } }}
          key={file.uid}
          items={[{
            uid: file.uid,
            name: file.name,
            status: 'done',
            size: file.size || null,
          }]}
          maxCount={1}
          disabled
        />
)}
    />
  )
}

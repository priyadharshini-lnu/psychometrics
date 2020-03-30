const Chat = ({
  title, titleDescription, managerName, messageList,
}, result: object): object => {
  result = {
    ...result, title, titleDescription, managerName,
  }
  return messageList.reduce((res: object, { position, text }) => ({ ...res, [`messageText${position}`]: text }), result)
}

export default Chat

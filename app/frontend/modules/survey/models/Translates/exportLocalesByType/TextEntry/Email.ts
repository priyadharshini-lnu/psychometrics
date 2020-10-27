const Email = ({
  title, titleDescription, contactList, subject,
}, result: object): object => {
  result = {
    ...result, title, titleDescription, subject,
  }

  // eslint-disable-next-line arrow-body-style
  return contactList.reduce((res: object, contact: string, i: number) => {
    return ({ ...res, [`contact${i}`]: contact })
  }, result)
}

export default Email

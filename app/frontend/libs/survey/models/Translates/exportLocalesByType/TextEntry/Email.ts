const Email = ({
  title, titleDescription, contactList,
}, result: object): object => {
  result = {
    ...result, title, titleDescription,
  }

  // eslint-disable-next-line arrow-body-style
  return contactList.reduce((res: object, contact: string, i: number) => {
    return ({ ...res, [`contact${i}`]: contact })
  }, result)
}

export default Email

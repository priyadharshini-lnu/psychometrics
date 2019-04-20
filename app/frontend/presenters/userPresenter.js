const userPresenter = {
  getFullName ({ firstName, lastName }) {
    if (lastName && firstName) return `${firstName} ${lastName}`
    return firstName || lastName
  },
}

export default userPresenter

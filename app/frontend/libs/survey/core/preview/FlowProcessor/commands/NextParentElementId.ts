const NextParentElementId = {
  run (id: string): string | null {
    const path: string[] = id.split('/')
    path.pop()
    if (path.length) {
      path[path.length - 1] = (+path[path.length - 1] + 1).toString()
      return path.join('/')
    }
    return null
  },
}
export default NextParentElementId

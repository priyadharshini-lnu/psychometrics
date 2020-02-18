const NextElementId = {
  run (id: string): string {
    if (!id) { return '0' }
    const path: string[] = id.split('/')
    path[path.length - 1] = (+path[path.length - 1] + 1).toString()
    return path.join('/')
  },
}

export default NextElementId

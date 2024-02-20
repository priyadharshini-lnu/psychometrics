export const updateArrayItemsPositionOnIndices = <T, >(inputArray: Array<T>, field: keyof T): Array<T> => inputArray
  .map((item, index: number) => ({ ...item, [field]: index + 1 }))

export const getGroupById = <T, >(groups: Array<T>, groupId, field: keyof T): T => groups
  .find(group => group[field] === groupId) || {} as T

export const getItemIdFromSortingId = (sortingId: string): number => {
  const [, id] = sortingId.split('_')
  return parseInt(id, 10)
}

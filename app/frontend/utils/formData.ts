import { UploadFile } from 'antd/es/upload/interface'
import _ from 'lodash'

export type FileData = Record<string, { file?: File | UploadFile }>
export const getFormDataForFiles = <T extends FileData>(values: T, names: string[]): FormData | null => {
  const files = { ..._.pick(values, names) }

  if (_.some(files, f => f && !!f.file)) {
    const formData = new FormData()
    _.each(files, (img, name) => {
      if (img?.file) {
        (img.file as UploadFile).status === 'removed'
          ? formData.append(`purge_${name}`, '1')
          : formData.append(name, img.file as File, img.file.name)
      }
    })
    return formData
  }
  return null
}

import ApiAction from 'interfaces/ApiAction'

import * as t from 'io-ts'
import { UploadFile } from 'antd/es/upload/interface'
import { createReducer } from '~/utils/redux'

export const DesignSettingsTR = t.type({
  id: t.string,
  backgroundColor: t.union([t.string, t.null]),
  background: t.union([t.string, t.null]),
  logo: t.union([t.string, t.null]),
  secondaryLogo: t.union([t.string, t.null]),
  loginBoxPosition: t.union([t.string, t.null]),
  backgroundSize: t.string,
  primaryColor: t.union([t.string, t.null]),
  errorColor: t.union([t.string, t.null]),
  warningColor: t.union([t.string, t.null]),
  successColor: t.union([t.string, t.null]),
  infoColor: t.union([t.string, t.null]),
  project: t.union([
    t.type({
      id: t.string,
    }),
    t.undefined]),
  logoAltText: t.union([t.string, t.null]),
  secondaryLogoAltText: t.union([t.string, t.null]),
})

export type DesignSettings = t.TypeOf<typeof DesignSettingsTR>

export const Schema = {
  type: 'design_settings',
  relationships: {
    project: {
      type: 'projects',
    },
  },
}

export interface Files {
  logo: {
    file?: File | UploadFile
  }
  background: {
    file?: File | UploadFile
  }
  background_overlay: {
    file?: File | UploadFile
  }
  secondary_logo: {
    file?: File | UploadFile
  }
}

export const UPLOAD_FILES = 'resource/designSettings/UPLOAD_FILES'

export const uploadFiles = (id: string, data: FormData): ApiAction<void> => ({
  type: UPLOAD_FILES,
  request: {
    method: 'put',
    url: `/api/v2/administration/design_settings/${id}/uploads`,
    body: data,
    contentType: 'multipart/form-data;' as const,
  },
})

export const reducer = createReducer({}, null)

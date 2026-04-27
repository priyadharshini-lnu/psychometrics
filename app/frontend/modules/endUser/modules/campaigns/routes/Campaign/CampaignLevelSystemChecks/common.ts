const { I18n } = window
export enum CHECK_STATUS {
  passed = I18n.t('enduser.pass'),
  failed = I18n.t('enduser.fail'),
  pending = I18n.t('enduser.pending'),
}

export enum CHECK_TYPE {
  browser = 'browser',
  network = 'network',
  video = 'video',
  results = 'results',
  audio = 'audio',
}

import BaseTranslate from './BaseTranslate'

class Image extends BaseTranslate {
  getValueByCode () {
    return this.module.props.url
  }

  exportLocales () {
    const result = {
      imageUrl: this.module.props.url,
    }

    return { ...result }
  }
}

export default Image

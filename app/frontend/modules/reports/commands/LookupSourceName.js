import I18nStore from '~/modules/reports/store/I18nStore'

const LookupSourceName = {
  call (sources, sourceKey, sourceType) {
    if (sourceType === 'Factor') {
      return I18nStore.tFactorName(sourceKey)
    }
    if (sourceType === 'DataSheet') {
      return sourceKey
    }
    if (sourceType === 'ExternalFactor') {
      return I18nStore.tExternalFactorName(sources.id, (sources.factors.find(f => f.id === sourceKey) || {}))
    }
    if (sourceType === 'SavilleFactor') {
      return I18nStore.tSavilleFactorName(sources.id, (sources.factors.find(f => f.id === sourceKey) || {}))
    }
    return (sources.factors.find(f => f.id === sourceKey) || {}).name
  },
}

export default LookupSourceName

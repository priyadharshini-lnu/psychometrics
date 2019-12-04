import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import PageList from 'rb/store/PageList'
import AppStore from 'rb/store/AppStore'
import Utils from 'rb/utils/Utils'

let { I18n } = window
if (I18n) {
  I18n.fallbacks = true
} else {
  I18n = {
    t (code) {
      return code
    },
  }
}
const TRANSLATED_MODULES = {
  Text: true,
  Table: ['CPITopFactors', 'StrengthClusters', 'InnovationStyles'],
  Graph: ['Circumplex'],
}
const EXTERNAL_CATEGORIES = ['hogan', 'mindmill']
// Template Structure
// {
//  question: {
//    447: {
//      choicesTexts1: '447 choicesTexts1 (translated)',
//      scalePointsTexts1: '447 scalePointsTexts1 (translated)',
//      regionsNames1: '447 regionsNames1 (translated)',
//      questionText: '447 questionText (translated)',
//    },
//    313: {
//      questionText: '313 Question'
//    }
//  },
//  'reports/filter': {
//    5: {
//      name: 'FILTER_5 (me)'
//    },
//    6: {
//      name: 'FILTER_6 (other)'
//    }
//  },
//  'reports/module': {
//    426: {
//      text: 'lala (translated)',
//      textConditions1: 'textConditions1 (tr)'
//    }
//  },
//  factor: {
//    459: {
//      name: 'Global (translated)'
//    },
//    460: {
//      name: 'Rubyable (translated)'
//    }
//  }
// }
const I18nStore = function () {
  this.locales = null
  this.locale = null
}

I18nStore.prototype = new EventEmitter()

_.extend(I18nStore.prototype, {
  t (code, data) {
    return I18n.t(code, data)
  },

  setLocale (locale) {
    if (locale) {
      I18n.locale = locale
      this.locale = locale
    }
  },

  tQuestion (question, field, extraData) {
    if (this.locales && this.locales.question && this.locales.question[question.id]) {
      if (this.locales.question[question.id][field]) {
        return this.locales.question[question.id][field]
      }
    }
    return question.tDefault(field, extraData)
  },

  tFilterName (filter) {
    if (this.locales && this.locales['reports/filter'] && this.locales['reports/filter'][filter.id]) {
      if (this.locales['reports/filter'][filter.id]) {
        return this.locales['reports/filter'][filter.id].name
      }
    }
    return filter && filter.name
  },

  isModuleTranslated (module) {
    if (TRANSLATED_MODULES[module.type]) {
      if (!Array.isArray(TRANSLATED_MODULES[module.type])) {
        return true
      }
      return _.includes(TRANSLATED_MODULES[module.type], module.props.type)
    }
  },

  // @deprecated, use this.tFactor(factor, 'name') instead
  tFactorName (factor) {
    if (_.get(this, `locales.factor.${factor.id}`)) {
      return this.locales.factor[factor.id].alias
    }
    return factor.alias || factor.name
  },

  tFactor (factor, key) {
    if (_.get(this, `locales.factor.${factor.id}.${key}`)) {
      return this.locales.factor[factor.id][key]
    }
    return factor[key]
  },

  tExternalFactorName (assessmentId, factor) {
    return _.get(this.locales, ['external/factor', assessmentId, factor.id], factor.name)
  },

  tOccupation (occupation, key) {
    if (this.locales && this.locales.occupation && this.locales.occupation[occupation.id]) {
      if (this.locales.occupation[occupation.id] && this.locales.occupation[occupation.id][Utils.toSnakeCase(key)]) {
        return this.locales.occupation[occupation.id][Utils.toSnakeCase(key)]
      }
    }
    return occupation[key]
  },

  tInnovationStyle (innovationStyle, key) {
    if (this.locales && this.locales.innovation_style && this.locales.innovation_style[innovationStyle.id]) {
      if (this.locales.innovation_style[innovationStyle.id]
        && this.locales.innovation_style[innovationStyle.id][Utils.toSnakeCase(key)]) {
        return this.locales.innovation_style[innovationStyle.id][Utils.toSnakeCase(key)]
      }
    }
    return innovationStyle[key]
  },

  isExistTModule (module, field) {
    return !!_.result(this.locales, `reports/module.${module.id}.${field}`)
  },

  tModule (module, field, extraData) {
    if (this.isExistTModule(module, field)) {
      return this.locales['reports/module'][module.id][field]
    }
    return module.tDefault(field, extraData)
  },

  exportReport () {
    const result = {
      'reports/filter': _.reduce(AppStore.report.filters, (hash, filter) => {
        hash[filter.id] = { name: filter.name }
        return hash
      }, {}),
      'reports/module': {},
      factor: _.reduce(AppStore.factors, (hash, factors) => {
        _.each(factors, (factor) => {
          hash[factor.id] = {
            name: factor.name,
            description: factor.description,
            alias: factor.alias,
          }
        })
        return hash
      }, {}),
      occupation: _.reduce(AppStore.occupations, (hash, occupations) => {
        _.each(occupations, (occupation) => {
          hash[occupation.id] = {
            name: occupation.name,
            description: occupation.description,
            full_description: occupation.fullDescription,
            potential_areas_of_study: occupation.potentialAreasOfStudy,
            key_career_tracks: occupation.keyCareerTracks,
            high_school_entry_roles: occupation.highSchoolEntryRoles,
            diploma_qualification: occupation.diplomaQualification,
            bachelors_or_masters_qualification: occupation.bachelorsOrMastersQualification,
            work_environment: occupation.workEnvironment,
          }
        })
        return hash
      }, {}),
    }
    _.each(PageList.list, (page) => {
      _.each(page.modules.list, (module) => {
        if (this.isModuleTranslated(module)) {
          result['reports/module'][module.id] = module.exportLocales()
        }
      })
    })
    AppStore.assessments.filter(x => EXTERNAL_CATEGORIES.includes(x.category) && x.factors)
      .forEach((x) => {
        x.factors.forEach((f) => {
          _.setWith(result, ['external/factor', x.id, f.id], f.name, Object)
        })
      })
    return result
  },
})

export default new I18nStore()

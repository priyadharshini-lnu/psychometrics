/* eslint-disable react/no-danger */
/* eslint-disable max-len */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import I18nStore from 'rb/store/I18nStore'
import invoiceIcon from 'rb/static/icons/invoice.png'
import cs from 'classnames'
import yaml from 'js-yaml'
import subTracksIcon from 'rb/static/icons/career-sub-tracks.svg'
import potentialAreaIcon from 'rb/static/icons/potential-areas-of-study.svg'
import workEnvironmentIcon from 'rb/static/icons/typical-work-environment.svg'
import careerStrengthsIcon from 'rb/static/icons/career-strengths.svg'


import { renderMarkdown } from 'rb/utils/Markdown'
import styles from './PotentialCareerFull.scss'


const MockOccupation = {
  id: 1,
  name: 'ADMINISTRATION, CONTRACTING AND PROCUREMENT',
  fullDescription: `
  Administration, Contracting and Procurement roles involve helping companies organise, and plan activities and source materials.
  Administration roles specifically involve planning, coordinating or undertaking administrative activities of an organisation,
  such as records and information management, mail distribution, planning, and other office support services.

  Contracts and Procurement professionals work with vendors and other companies to source products and services for the company,
  proactively identifying opportunities to reduce costs. They put in place processes to ensure that product providers are identified,
  assessed and selected effectively. Following selection of a provider, they may be involved in setting and negotiating contract terms and
  conditions and maintaining relationships with vendors to monitor product and service delivery.

  Work activities include dealing with conflicts and issues, tracking progress against agreed
  timelines and reviewing the quality of services and products purchased.
  `,
  potentialAreasOfStudy: `
  Management Supply Chain
  Business Administration
  Accounting
  `,
  workEnvironment: `
  * Fixed Working Hours
  * Process Driven
  * Structured Environment
  * High Communication (emails & calls)
  `,
  keyCareerTracks: `
levels:
  entry: &entry Entry Level
  advanced: &advanced Prior Experience / Advanced Education
tracks:
- title: Contract Management
  description: >
    Manage the legal contracts and terms and conditions between an organisation and other organisations providing services or goods. Manage the contract negotiation, record keeping and maintenance to ensure all contract terms continue to be met.
  levels:
  - title: *entry
    roles:
    - Contracts Administrator
    - Contracts Coordinator
    - Development Project Coordinator
    - Administrative Assistant – Contacts
  - title: *advanced
    roles:
    - Assistant Contracts Manager
    - Contract Manager
    - Contract Specialist
    - Senior Contracts Manager
- title: Procurement
  description: >
    Arrange the purchase of equipment, machinery, tools, parts, or necessary materials for operation in an organisation, or for refinement into other products or services sold by the company. Seek the high-quality goods providers at the best terms to ensure companies get the best return on investment.
  levels:
  - title: *entry
    roles:
    - Procurement Clerks
    - Material Recording Clerks
    - Bill and Accounts Collector
    - Assistant Buyer
  - title: *advanced
    roles:
    - Contracts and Procurement Executive
    - Procurement Buyer/ Procurement Manager
    - Procurement Specialist/Purchasing Manager
    - Director of Strategic Sourcing
- title: Administrative Service
  description: >
    Conducting various administrative tasks across different settings to ensure the effective operation of the organisation. May involve coordinating, planning and supporting other staff with different business activities.
  levels:
  - title: *entry
    roles:
    - Receptionist
    - Administrative Assistant
    - Office Administrator
    - Personal Assistant
  - title: *advanced
    roles:
    - General Office Clerk
    - Administrative Service Manager
    - Office Manager
    - Materials Manager
factors:
- id: 1
  description: Considering other people's emotions, preferences and thoughts. Taking decisions based on the impact of your choices on others.
- id: 2
  description: Generating new ideas, demonstrate thinking out of the box. Pushing yourself and others to identify novel ways of doing things.
- id: 3
  description: Being inquisitive and asking questions. A desire to learn and understand why and how things work.
- id: 4
  description: Believing in the capacity of self and others to improve, change and realise your full potential.
- id: 5
  description: Being able to deal with, and bounce back from setbacks, failures and challenges.
  `,
  stars: 4,
  icon: invoiceIcon,
  highSchoolEntryRoles: 'HR Administrator',
  diplomaQualification: 'HR Assistant\nTraining Co-ordinator\nCompensation and Benefits Assistant',
  bachelorsOrMastersQualification: 'HR/Learning and Development Advisor\nHR/Learning and Development Specialist\nBachelors or Masters\nHR Business Partner\nQualification\nTalent or Organisational Development Advisor\nHuman Capital Consultant',
  factors: [
    {
      id: 1,
      alias: 'Empathy',
      position: 1,
      meanNormScore: 3,
    },
    {
      id: 2,
      alias: 'Creativity',
      position: 2,
      meanNormScore: 4,
    },
    {
      id: 3,
      alias: 'Curiosity',
      position: 3,
      meanNormScore: 1,
    },
    {
      id: 4,
      alias: 'Growth',
      position: 4,
      meanNormScore: 3,
    },
    {
      id: 5,
      alias: 'Resilience',
      position: 5,
      meanNormScore: 5,
    },
    {
      id: 6,
      alias: 'Optimism',
      position: null,
      meanNormScore: 3,
    },
  ],
}

class PotentialCareerFull extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
  }

  getColorByScore (score) {
    if (score === 1 || score === 2) { return '#DD0506' }
    if (score === 3) { return '#F89331' }
    if (score === 4 || score === 5) { return '#00B050' }
    return '#ccc'
  }

  getStrengthFactorText (factorId) {
    if (!this.keyCareerTracks.factors) {
      return false
    }
    const factor = this.keyCareerTracks.factors.find(x => x.id === factorId)
    return _.get(factor, 'description')
  }

  getTextByScore (score) {
    if (score === 1 || score === 2) { return I18nStore.t('reports.modules.potential_career_full.strength_low') }
    if (score === 3) { return I18nStore.t('reports.modules.potential_career_full.strength_moderate') }
    if (score === 4 || score === 5) { return I18nStore.t('reports.modules.potential_career_full.strength_high') }
    return '-'
  }

  prepareRows () {
    const { module, module: { props } } = this.props
    if (ResultStore.realResults) {
      this.occupationData = ResultStore.results[module.assessment_id].getOccupationByRank(props.topPosition)
    } else {
      this.occupationData = MockOccupation
    }
    this.keyCareerTracks = null
    try {
      this.keyCareerTracks = yaml.safeLoad(I18nStore.tOccupation(this.occupationData, 'keyCareerTracks'))
    } catch (e) {
      console.error(e)
    }
    this.factors = this.occupationData.factors.filter(x => x.position).sort((a, b) => a.position - b.position).slice(0, 5)
  }

  renderTrack (track, i) {
    return (
      <div className={styles.trackBox} key={i}>
        <div className={styles.trackTitle}>{track.title}</div>
        <div className={styles.trackDescription} dangerouslySetInnerHTML={{ __html: renderMarkdown(track.description) }} />
      </div>
    )
  }

  renderFactor (factor, i) {
    const style = {
      backgroundColor: this.getColorByScore(factor.meanNormScore),
    }
    return (
      <div className={styles.factorBox} key={i}>
        <div className={styles.factorTitle}>
          <div className={styles.factorName}>{I18nStore.tFactor(factor, 'alias')}</div>
        </div>
        <div className={styles.factorScoreText} style={style}>{this.getTextByScore(factor.meanNormScore)}</div>
        <div className={styles.factorDescription}>{this.getStrengthFactorText(factor.id)}</div>
      </div>
    )
  }

  renderStars (stars) {
    return (
      <div className={styles.stars}>
        {_.times(stars, i => (
          <i key={i} className={`${styles.star} ${styles.full}`} />
        ))}
        {_.times(5 - stars, i => (
          <i key={i} className={styles.star} />
        ))}
      </div>
    )
  }

  render () {
    const { module } = this.props
    const { fontSize, fontFamily } = module.props.style
    const style = {
      fontSize,
      fontFamily,
    }
    this.prepareRows()
    if (!this.occupationData) { return false }
    return (
      <div className={styles.container} style={style}>
        <div className={styles.title}>
          <img src={this.occupationData.icon} className={styles.icon} />
          <div className={styles.titleText}>{I18nStore.tOccupation(this.occupationData, 'name')}</div>
          <div className={styles.suitability}>{I18nStore.t('reports.modules.potential_career_full.your_suitability')}</div>
          {this.renderStars(this.occupationData.stars)}
        </div>

        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(I18nStore.tOccupation(this.occupationData, 'fullDescription')) }}
        />

        <div className={styles.details}>
          <div className={styles.left}>
            <div className={styles.panel}>
              <div className={styles.panelTitle}>
                <img src={potentialAreaIcon} className={styles.icon} />
                <div className={styles.titleText}>{I18nStore.t('reports.modules.potential_career_full.potential_areas_of_study')}</div>
                <div className={styles.line} />
              </div>
              <div
                className={styles.panelBody}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(I18nStore.tOccupation(this.occupationData, 'potentialAreasOfStudy')) }}
              />
            </div>
            <div className={styles.panel}>
              <div className={styles.panelTitle}>
                <img src={workEnvironmentIcon} className={styles.icon} />
                <div className={styles.titleText}>{I18nStore.t('reports.modules.potential_career_full.work_environment')}</div>
                <div className={styles.line} />
              </div>
              <div
                className={styles.panelBody}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(I18nStore.tOccupation(this.occupationData, 'workEnvironment')) }}
              />
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.panel}>
              <div className={styles.panelTitle}>
                <img src={subTracksIcon} className={styles.icon} />
                <div className={styles.titleText}>{I18nStore.t('reports.modules.potential_career_full.career_sub_tracks')}</div>
                <div className={styles.line} />
              </div>
              <div className={styles.panelBody}>
                {this.keyCareerTracks && (
                  <div className={styles.tracks}>
                    {this.keyCareerTracks.tracks.map((track, i) => (
                      this.renderTrack(track, i)
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={cs(styles.panel, styles.strengths)}>
          <div className={styles.panelTitle}>
            <img src={careerStrengthsIcon} className={styles.icon} />
            <div className={styles.titleText}>{I18nStore.t('reports.modules.potential_career_full.career_strengths_and_results')}</div>
            <div className={styles.line} />
          </div>
          <div className={styles.panelBody}>
            {this.factors && (
              <div className={styles.factors}>
                {this.factors.map((factor, i) => (
                  this.renderFactor(factor, i)
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default PotentialCareerFull

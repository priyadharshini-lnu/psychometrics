/* eslint-disable max-len */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import ResultStore from 'rb/store/ResultStore'
import I18nStore from 'rb/store/I18nStore'
import invoiceIcon from 'rb/static/icons/invoice.png'
import cs from 'classnames'
import yaml from 'js-yaml'
import styles from './PotentialKeyCareerTracks.scss'

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
tracks:
- title: Medicine
  description: >
    Diagnose, treat and prevent medical ailments such as injuries, conditions and diseases. The role involves working directly with patients and diagnosing their symptoms and administering and specifying treatments for them. It may also include conducting surgery using medical equipment.
  levels:
    entry:
    - Medical or Surgical Intern
    - Medical or Surgical Assistant
    advanced:
    - Resident Doctor
    - Anesthesiologist
    - Attending Doctor
    - Specialist or Consultant Doctor / Surgeon
    - Dentist / Orthodontist
    - Director of Medicine or Surgery
- title: Medical Research
  description: >
    Conduct research and experiments into medical ailments and treatments to identify new and improved ways of diagnosing and treating various health conditions.
  levels:
    entry:
    - Research Assistant
    - Laboratory Technician
    - Clinical Research Associate
    advanced:
    - Cytotechnologist
    - Medical Coder
    - Immunologist Researcher
    - Analytical Chemist
    - Biotechnologist
    - Pharmacologist
    - Biomedical Scientist
    - Biomedical Engineer
    - Head of Research
    - Program Director
- title: Medical Field (Support Roles, Nursing)
  description: >
    Assess patient health problems and needs, administer treatments and nursing care to patients, develop and implement nursing care plans, and maintain medical records.
  levels:
    entry:
    - Paramedic
    - Nurse's Assistant
    - Medical Receptionist
    - Patient Care Assistant
    - Nursing Administrator
    - Clinical Support Worker
    advanced:
    - Patient Advisor
    - Patient Care Worker
    - Nurse Associate Practitioner
    - Midwife
    - Pharmacist
    - Nurse
    - Clinical Director / Matron
    - Nurse Consultant
- title: Allied Health
  description: >
    Provide health related diagnostics and treatment services in specialised areas, not otherwise delivered by medical doctors. Includes specialisations in areas such as Physiotherapy and Pharmacology and other health disciplines.
  levels:
    entry:
    - Sonographer / Radiologist / Medical Coder / Medical Interpreter
    - Medical Transcriptionist / Recreational Therapist / Dental Hygienist
    advanced:
    - Physiotherapist / Chiropractor / Podiatrist / Anesthesia Technician
    - Optician / Optometrist / Paramedic
    - Biomedical Scientist / Allergist
    - Surgical Technologist
    - Speech Scientist / Speech Therapist / Pathologist
  `,
  stars: 4,
  icon: invoiceIcon,
  highSchoolEntryRoles: 'HR Administrator',
  diplomaQualification: 'HR Assistant\nTraining Co-ordinator\nCompensation and Benefits Assistant',
  bachelorsOrMastersQualification: 'HR/Learning and Development Advisor\nHR/Learning and Development Specialist\nBachelors or Masters\nHR Business Partner\nQualification\nTalent or Organisational Development Advisor\nHuman Capital Consultant',
}

class PotentialKeyCareerTracks extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
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
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  renderTrack = (track, i) => {
    if (!track.levels) return false
    const roles = _.flatMap(track.levels, (roles, level) => _.isArray(roles) && roles.map(role => ({ role, level })))
    return (
      <div className={styles.track} key={i}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            <div className={styles.trackTitle}>{track.title}</div>
            <div className={styles.line} />
          </div>
          <div className={styles.panelBody}>
            {roles.map((x, i) => (
              <span className={cs(styles.role, styles[x.level])} key={i}>{x.role}</span>
            ))}
          </div>
        </div>
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
    const { module: model } = this.props
    const { fontSize, fontFamily } = model.props.style
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
        <div className={styles.description}>
          {I18nStore.t('reports.modules.potential_career_full.key_career_tracks_within', { occupation: I18nStore.tOccupation(this.occupationData, 'name') })}
        </div>
        {_.get(this.keyCareerTracks, 'tracks') && (
          <div className={styles.tracks}>
            {this.keyCareerTracks.tracks.map((x, i) => this.renderTrack(x, i))}
          </div>
        )}
      </div>
    )
  }
}

export default PotentialKeyCareerTracks

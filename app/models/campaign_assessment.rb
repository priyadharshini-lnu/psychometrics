# frozen_string_literal: true

class CampaignAssessment < ApplicationRecord
  audited

  belongs_to :campaign
  belongs_to :assessment
  belongs_to :norm
  belongs_to :assessor_form, class_name: 'Assessment'
  belongs_to :campaign_assessment_group
  belongs_to :mettl_schedule_record, optional: true
  belongs_to :occupation_condition_set, optional: true
  include Tenantable

  scope :ungrouped, -> { where(campaign_assessment_group_id: nil) }
  scope :preworks, -> { where(prework: true) }
  scope :workshop_activities, -> { where(workshop_activity: true) }

  validate :validate_external_config
  before_save :parse_external_config

  attr_accessor :skip_set_position

  before_create :set_position, unless: :skip_set_position
  before_commit :invalidate_assessment_cache, if: -> { norm_id_changed? || available_locales_changed? }

  delegate :common?,
           :hogan?,
           :external?,
           :saville?,
           :iiht?,
           :mettl?,
           :microsite?,
           :simulation?,
           :has_external_norm?,
           :external_assessment_id,
           :assessor_form?,
           :dimension,
           :pearson?,
           :mhs?,
           :has_ai_questions?,
           :has_transcription_enabled_questions?,
           to: :assessment

  delegate :normalize_factor_scores?, to: :project_assessment, allow_nil: true

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name category archived campaign_id workshop_activity campaign_assessment_group_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[assessment]
  end

  def validate_external_config
    return unless external_config.presence.is_a?(String)

    config = JSON.parse(external_config)
    validate_mhs_external_config(config) if mhs?
  rescue JSON::ParserError
    errors.add(:external_config, :invalid)
  end

  def parse_external_config
    self.external_config = external_config.presence.is_a?(String) ? JSON.parse(external_config) : nil
  end

  def expired?
    return false if key_expires_at.nil?

    Time.zone.now > key_expires_at.to_i
  end

  def has_valid_universal_link?
    assessment_key.present? && !expired?
  end

  def set_position
    self.position = (campaign.
      campaign_assessments.
      where(campaign_assessment_group_id: campaign_assessment_group_id).
      maximum('position') || 0) + 1
  end

  def norm_name
    return pearson_norm_name if assessment.pearson?
    return saville_norm_name if assessment.saville?

    norm&.name
  end

  def update_norm!(norm_id)
    return update!(external_norm_id: norm_id) if has_external_norm?

    update!(norm_id: norm_id)
  end

  def update_mettl_schedule!(mettl_schedule_record_id, apply_to_existing_users = false)
    return unless mettl_schedule_record_id
    return unless mettl?

    if update!(mettl_schedule_record_id: mettl_schedule_record_id) && apply_to_existing_users
      not_started_assessments = user_assessments.where(status: :not_started).pluck(:id)

      MettlUserAssessment.where(user_assessment_id: not_started_assessments).update_all(
        mettl_schedule_record_id: mettl_schedule_record_id
      )
    end
  end

  def update_content_variation!(external_config, apply_to_existing_users = false)
    return unless simulation?

    if update!(external_config: external_config) && apply_to_existing_users
      not_started_assessments = user_assessments.where(status: :not_started).pluck(:id)

      SimulationUserAssessment.where(user_assessment_id: not_started_assessments).update_all(
        content_variation_id: self.external_config['content_variation_id']
      )
    end
  end

  def update_pearson_variation!(external_config, apply_to_existing_users = false)
    return unless pearson?

    if update!(external_config: external_config) && apply_to_existing_users
      not_started_assessments = user_assessments.where(status: :not_started).pluck(:id)

      PearsonUserAssessment.where(user_assessment_id: not_started_assessments).update_all(
        variation: self.external_config['variation']
      )
    end
  end

  def update_mhs_confidence_interval!(confidence_interval, apply_to_existing_users = false)
    return unless mhs?

    config = parsed_external_config
    config['confidence_interval'] = confidence_interval

    if update!(external_config: config.to_json) && apply_to_existing_users
      not_started_assessments = user_assessments.where(status: :not_started).pluck(:id)

      MhsUserAssessment.where(user_assessment_id: not_started_assessments).update_all(
        confidence_interval: external_config['confidence_interval']
      )
    end
  end

  def update_mhs_leadership_bar!(leadership_bar, apply_to_existing_users = false)
    return unless mhs?

    config = parsed_external_config
    config['leadership_bar'] = leadership_bar

    if update!(external_config: config.to_json) && apply_to_existing_users
      not_started_assessments = user_assessments.where(status: :not_started).pluck(:id)

      MhsUserAssessment.where(user_assessment_id: not_started_assessments).update_all(
        leadership_bar: external_config['leadership_bar']
      )
    end
  end

  def update_mhs_norm_region!(norm_region, apply_to_existing_users = false)
    return unless mhs?

    config = parsed_external_config
    config['norm_region'] = norm_region

    if update!(external_config: config.to_json) && apply_to_existing_users
      not_started_assessments = user_assessments.where(status: :not_started).pluck(:id)

      MhsUserAssessment.where(user_assessment_id: not_started_assessments).update_all(
        norm_region: external_config['norm_region']
      )
    end
  end

  def update_mhs_norm_option!(norm_option, apply_to_existing_users = false)
    return unless mhs?

    config = parsed_external_config
    config['norm_option'] = norm_option

    if update!(external_config: config.to_json) && apply_to_existing_users
      not_started_assessments = user_assessments.where(status: :not_started).pluck(:id)

      MhsUserAssessment.where(user_assessment_id: not_started_assessments).update_all(
        norm_option: external_config['norm_option']
      )
    end
  end

  def update_prework(prework, apply_to_existing_users = false)
    if update!(prework: prework) && apply_to_existing_users
      not_started_assessments = user_assessments.where(status: :not_started)
      not_started_assessments.update_all(prework: prework)
    end
  end

  def user_assessments
    UserAssessment.where(campaign_id: campaign_id, assessment_id: assessment_id)
  end

  def project_assessment
    assessment.project_assessments.find_by(project_id: campaign.project_id)
  end

  def log_attributes
    slice(:campaign_id, :assessment_id, :norm_id)
  end

  private

  def pearson_norm_name
    Assessments::PearsonSettings.
      norms(external_assessment_id)&.
      find { |norm| norm[:id] == external_norm_id }&.dig(:name)
  end

  def saville_norm_name
    Settings.providers.saville.norms.find { |norm| norm[:id] == external_norm_id }&.dig(:name)
  end

  def invalidate_assessment_cache
    assessment.invalidate_cache
  end

  def validate_mhs_external_config(config)
    if config['confidence_interval'].present? && [0, 1].exclude?(config['confidence_interval'])
      errors.add(
        :external_config,
        I18n.t('admin.campaign_assessment_mhs_invalid_confidence_interval')
      )
    end

    if config['leadership_bar'].present? && [0, 1].exclude?(config['leadership_bar'])
      errors.add(
        :external_config,
        I18n.t('admin.campaign_assessment_mhs_invalid_leadership_bar')
      )
    end

    if config['norm_region'].present? && (0..8).exclude?(config['norm_region'])
      errors.add(:external_config, I18n.t('admin.campaign_assessment_mhs_invalid_norm_region'))
    end

    if config['norm_option'].present? && (0..3).exclude?(config['norm_option'])
      errors.add(:external_config, I18n.t('admin.campaign_assessment_mhs_invalid_norm_option'))
    end
  end

  def parsed_external_config
    external_config.is_a?(String) ? JSON.parse(external_config) : (external_config || {})
  end
end

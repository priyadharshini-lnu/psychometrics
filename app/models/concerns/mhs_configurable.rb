# frozen_string_literal: true

module MhsConfigurable
  extend ActiveSupport::Concern

  included do
    validate :validate_mhs_external_config, if: :validate_external_config_mhs?
  end

  def update_mhs_confidence_interval!(confidence_interval, apply_to_existing_users = false)
    return unless mhs?

    config = parsed_external_config
    config['confidence_interval'] = confidence_interval

    if update!(external_config: config.to_json) && apply_to_existing_users
      update_not_started_assessments_mhs(:confidence_interval, confidence_interval)
    end
  end

  def update_mhs_leadership_bar!(leadership_bar, apply_to_existing_users = false)
    return unless mhs?

    config = parsed_external_config
    config['leadership_bar'] = leadership_bar

    if update!(external_config: config.to_json) && apply_to_existing_users
      update_not_started_assessments_mhs(:leadership_bar, leadership_bar)
    end
  end

  def update_mhs_norm_region!(norm_region, apply_to_existing_users = false)
    return unless mhs?

    config = parsed_external_config
    config['norm_region'] = norm_region

    if update!(external_config: config.to_json) && apply_to_existing_users
      update_not_started_assessments_mhs(:norm_region, norm_region)
    end
  end

  def update_mhs_norm_option!(norm_option, apply_to_existing_users = false)
    return unless mhs?

    config = parsed_external_config
    config['norm_option'] = norm_option

    if update!(external_config: config.to_json) && apply_to_existing_users
      update_not_started_assessments_mhs(:norm_option, norm_option)
    end
  end

  private

  def validate_external_config_mhs?
    assessment.present? && mhs? && external_config.presence.is_a?(String)
  end

  def validate_mhs_external_config
    config = JSON.parse(external_config)
    validate_mhs_confidence_interval(config)
    validate_mhs_leadership_bar(config)
    validate_mhs_norm_option(config)
  rescue JSON::ParserError
    errors.add(:external_config, :invalid)
  end

  def validate_mhs_confidence_interval(config)
    return unless config['confidence_interval'].present? && [0, 1].exclude?(config['confidence_interval'])

    errors.add(:external_config, I18n.t('admin.campaign_assessment_mhs_invalid_confidence_interval'))
  end

  def validate_mhs_leadership_bar(config)
    return unless config['leadership_bar'].present? && [0, 1].exclude?(config['leadership_bar'])

    errors.add(:external_config, I18n.t('admin.campaign_assessment_mhs_invalid_leadership_bar'))
  end

  def validate_mhs_norm_option(config)
    return unless config['norm_option'].present? && (config['norm_option'].negative? || config['norm_option'] > 3)

    errors.add(:external_config, I18n.t('admin.campaign_assessment_mhs_invalid_norm_option'))
  end

  def update_not_started_assessments_mhs(attribute, value)
    not_started_assessments = user_assessments.where(status: :not_started).pluck(:id)
    MhsUserAssessment.where(user_assessment_id: not_started_assessments).update_all(attribute => value)
  end
end

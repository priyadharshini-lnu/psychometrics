# frozen_string_literal: true

class PearsonUserAssessment < ApplicationRecord
  audited

  belongs_to :user_assessment
  include Tenantable

  tenant_source :user_assessment

  delegate :user_reports, to: :user_assessment

  def timing_text
    pearson_variation = user_assessment.assessment.pearson_variations&.find { |v| v.code == variation }
    return unless pearson_variation

    if pearson_variation.configuration.enable_timers
      I18n.t('enduser.pearson_timing_duration_minutes', duration: pearson_variation.duration_minutes)
    else
      I18n.t('enduser.pearson_timing_untimed_duration')
    end
  end
end

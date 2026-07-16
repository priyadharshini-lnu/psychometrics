# frozen_string_literal: true

class PearsonUserAssessment < ApplicationRecord
  audited

  belongs_to :user_assessment
  include Tenantable

  tenant_source :user_assessment

  delegate :user_reports, to: :user_assessment

  def duration_minutes
    pearson_variation = user_assessment.assessment.pearson_variations&.find { |v| v.code == variation }
    pearson_variation&.duration_minutes
  end
end

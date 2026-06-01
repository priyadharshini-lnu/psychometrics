# frozen_string_literal: true

class FactorsScoring < ApplicationRecord
  audited

  include Copyable

  self.table_name = :factors_scoring

  enum :scoring_strategy, {
    answers_average: 0,
    answers_sum: 1
  }

  belongs_to :assessment
  belongs_to :factor
  belongs_to :question

  tenant_config has_global_records: true, optional: true
  include Tenantable

  tenant_source :assessment

  before_create :set_assessment_id, if: proc { assessment_id.nil? }
  before_commit :invalidate_assessment_cache

  scope :with_props, -> { where('factors_scoring.props->>0 is not null') }

  def self.factor_question_ids(assessment_ids)
    FactorsScoring.where(assessment_id: assessment_ids).
      where('json_array_length(props) > 0').group(:factor_id).pluck(
        :factor_id, 'array_agg(question_id)'
      ).to_h
  end

  # Using for deep clone in Assessment model
  def set_assessment_id
    self.assessment_id = question.try(:assessment_id) || question.block.try(:assessment_id)
  end

  def invalidate_assessment_cache
    assessment.invalidate_cache if assessment.present?
  end
end

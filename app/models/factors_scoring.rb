# frozen_string_literal: true

class FactorsScoring < ApplicationRecord
  audited

  include Copyable
  self.table_name = :factors_scoring

  belongs_to :assessment
  belongs_to :factor
  belongs_to :question

  before_create :set_assessment_id, if: proc { assessment_id.nil? }
  after_commit :invalidate_assessment_cache

  scope :with_props, -> { where('factors_scoring.props->>0 is not null') }

  # Using for deep clone in Assessment model
  def set_assessment_id
    self.assessment_id = question.try(:assessment_id) || question.block.try(:assessment_id)
  end

  def invalidate_assessment_cache
    assessment.invalidate_cache if assessment.present?
  end
end

# == Schema Information
#
# Table name: factors_scoring
#
#  id            :integer          not null, primary key
#  props         :json
#  factor_id     :integer
#  assessment_id :integer
#  question_id   :integer
#

class FactorsScoring < ApplicationRecord
  include Copyable
  self.table_name = :factors_scoring

  belongs_to :assessment
  belongs_to :factor
  belongs_to :question

  before_create :set_assessment_id, if: proc { assessment_id.nil? }

  scope :with_props, -> { where('factors_scoring.props->>0 is not null') }

  # Using for deep clone in Assessment model
  def set_assessment_id
    self.assessment_id = question.try(:assessment_id) || question.block.try(:assessment_id)
  end
end

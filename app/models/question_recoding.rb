class QuestionRecoding < ApplicationRecord
  include Copyable
  self.table_name = :question_recoding

  belongs_to :assessment
  belongs_to :question

  before_create :set_assessment_id, if: proc { assessment_id.nil? }

  def set_assessment_id
    self.assessment_id = question.try(:assessment_id) || question.block.try(:assessment_id)
  end
end

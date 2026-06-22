# frozen_string_literal: true

class QuestionRecoding < ApplicationRecord
  audited

  include Copyable

  self.table_name = :question_recoding

  belongs_to :assessment
  belongs_to :question

  tenant_config has_global_records: true, optional: true
  include Tenantable

  tenant_source :assessment

  before_create :set_assessment_id, if: proc { assessment_id.nil? }

  def set_assessment_id
    self.assessment_id = question.try(:assessment_id) || question.block.try(:assessment_id)
  end
end

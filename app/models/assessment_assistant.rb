# frozen_string_literal: true

class AssessmentAssistant < ApplicationRecord
  belongs_to :assessment
  belongs_to :ai_assistant, class_name: 'AI::Assistant'

  tenant_config has_global_records: true, optional: true
  include Tenantable

  tenant_source :assessment

  validates :assessment_prompt, length: { maximum: 10_000 }, allow_blank: true
end

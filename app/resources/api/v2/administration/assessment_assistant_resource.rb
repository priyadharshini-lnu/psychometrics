# frozen_string_literal: true

class Api::V2::Administration::AssessmentAssistantResource < Api::V2::Administration::BaseResource
  attributes :assessment_id, :ai_assistant_id, :assessment_prompt

  has_one :assessment, class_name: 'Assessment'
  has_one :ai_assistant, class_name: 'AI::Assistant'

  def assessment_id
    @model.assessment_id.to_s
  end

  def ai_assistant_id
    @model.ai_assistant_id.to_s
  end

  def self.find_by_key(key, options = {})
    context = options[:context]
    record = AssessmentAssistant.find_or_initialize_by(assessment_id: key)
    new(record, context)
  end
end

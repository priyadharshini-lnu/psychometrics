# frozen_string_literal: true

class AssessmentAssistant < ApplicationRecord
  belongs_to :assessment
  belongs_to :ai_assistant, class_name: 'AI::Assistant'

  validates :assessment_prompt, length: { maximum: 10_000 }, allow_blank: true
end

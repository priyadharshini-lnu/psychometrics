# frozen_string_literal: true

class AI::Assistant < ApplicationRecord
  has_many :assistant_prompts
  has_one :default_prompt, -> { where(is_default: true) }, class_name: 'AI::AssistantPrompt'
end

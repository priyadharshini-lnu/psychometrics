# frozen_string_literal: true

class AI::Assistant < ApplicationRecord
  has_one :default_prompt, -> { where(is_default: true) }, class_name: 'AI::AssistantPrompt'
  belongs_to :owner, class_name: 'Client', optional: true
  belongs_to :last_modified_by, class_name: 'User', optional: true
end

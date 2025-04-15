# frozen_string_literal: true

class AI::AssistantPrompt < ApplicationRecord
  belongs_to :assistant, class_name: 'AI::Assistant'
  belongs_to :owner, class_name: 'Client', optional: true
  belongs_to :last_modified_by, class_name: 'User'
end

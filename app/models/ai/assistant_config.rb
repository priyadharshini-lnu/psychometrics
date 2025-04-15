# frozen_string_literal: true

class AI::AssistantConfig < ApplicationRecord
  belongs_to :assistant, class_name: 'AI::Assistant'
end

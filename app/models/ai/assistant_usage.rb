# frozen_string_literal: true

class AI::AssistantUsage < ApplicationRecord
  belongs_to :assistant_usage, class_name: 'AI::AssistantUsage'
  belongs_to :assistant, class_name: 'AI::Assistant'
  belongs_to :license
end

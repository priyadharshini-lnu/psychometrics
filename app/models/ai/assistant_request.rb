# frozen_string_literal: true

class AI::AssistantRequest < ApplicationRecord
  belongs_to :user
  belongs_to :assistant, class_name: 'AI::Assistant'
  belongs_to :license_usage, optional: true
  has_many :assistant_requests, class_name: 'AI::AssistantRequest'
end

# frozen_string_literal: true

class UsersResult < ApplicationRecord
  belongs_to :subject, class_name: 'User'
  belongs_to :evaluator, class_name: 'User'
  belongs_to :assessment
  belongs_to :campaign
  enum status: { not_started: 0, in_progress: 1, completed: 2 }

  scope :actual_by_options, lambda { |options|
    where('subject_id != evaluator_id') unless options.participants.dig("subject", "can_evaluate_self")
  }
end

# frozen_string_literal: true

class UsersResult < ApplicationRecord
  belongs_to :subject, class_name: 'User'
  belongs_to :evaluator, class_name: 'User'
  belongs_to :assessment
  enum status: { not_started: 0, in_progress: 1, completed: 2 }
end

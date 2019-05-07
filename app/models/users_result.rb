# frozen_string_literal: true

class UsersResult < ApplicationRecord
  belongs_to :subject, class_name: 'User'
  belongs_to :evaluator, class_name: 'User'
  belongs_to :norm
  belongs_to :assessment
  enum status: %i[not_started in_progress completed]
end

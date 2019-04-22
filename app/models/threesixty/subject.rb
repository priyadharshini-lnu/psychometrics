module Threesixty
  class Subject < ApplicationRecord
    belongs_to :user
    belongs_to :campaign, class_name: '::Campaign'
    belongs_to :evaluator, foreign_key: :user_id, primary_key: :user_id, inverse_of: :subject
    has_many :subjects_relationships, primary_key: :user_id

    enum report_approval_status: { waiting: 0, approved: 1, denied: 2 }, _prefix: :report
  end
end

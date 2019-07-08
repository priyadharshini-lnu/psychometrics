module Threesixty
  class Subject < ApplicationRecord
    include Threesixty::Participatable

    has_many :participants, foreign_key: :subject_id, primary_key: :user_id
    belongs_to :self_evaluator, foreign_key: :user_id, primary_key: :user_id, inverse_of: :self_subject, class_name: 'Threesixty::Evaluator'
    has_many :subjects_relationships, primary_key: :user_id

    enum report_approval_status: { waiting: 0, approved: 1, denied: 2 }, _prefix: :report
    enum report_release_status: { waiting: 0, released: 1, on_hold: 2}, _prefix: :report_status
    enum evaluation_status: { in_progress: 0, completed: 1 }, _prefix: :evaluation_status

    def evaluators
      participants.includes(:relationship, :subject, :evaluator).where(campaign_id: campaign_id)
    end
  end
end

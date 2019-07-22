module Threesixty
  class Participant < ApplicationRecord
    belongs_to :subject, class_name: 'User'
    belongs_to :evaluator, class_name: 'User'
    belongs_to :project, class_name: 'Client'
    belongs_to :campaign
    belongs_to :relationship

    def threesixty_evaluator
      Threesixty::Evaluator.find_by(campaign_id: campaign_id, user_id: evaluator_id)
    end

    def threesixty_subject
      Threesixty::Subject.find_by(campaign_id: campaign_id, user_id: subject_id)
    end

    enum manager_nomination_status: { waiting: 0, approved: 1, denied: 2 }, _prefix: :manager_nomination
    enum evaluator_nomination_status: { waiting: 0, completed: 1, denied: 2 }, _prefix: :evaluator_nomination
    enum manager_evaluation_status: { waiting: 0, approved: 1, denied: 2 }, _prefix: :manager_evaluation

    scope :active, -> { where.not(manager_nomination_status: :denied, evaluator_nomination_status: :denied) }
    scope :actual_by_options, lambda { |options|
      where('threesixty_participants.subject_id != threesixty_participants.evaluator_id') unless options.participants.dig('subject', 'can_evaluate_self')
    }
  end
end

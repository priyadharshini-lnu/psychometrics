# frozen_string_literal: true

module Threesixty
  class Participant < UsersCampaignsAssessment
    self.inheritance_column = :disabled
    self.table_name = 'users_campaigns_assessments'

    before_create do
      self.assessment_id = threesixty_campaign&.assessment_id unless assessment_id?
    end

    def threesixty_campaign
      campaign.threesixty_campaign
    end

    def threesixty_evaluator
      Threesixty::Evaluator.find_by(campaign_id: campaign_id, user_id: evaluator_id)
    end

    def threesixty_subject
      Threesixty::Subject.find_by(campaign_id: campaign_id, user_id: subject_id)
    end

    enum manager_nomination_status: { waiting: 0, approved: 1, denied: 2 }, _prefix: :manager_nomination
    enum evaluator_nomination_status: { waiting: 0, completed: 1, declined: 2 }, _prefix: :evaluator_nomination
    enum manager_evaluation_status: { waiting: 0, approved: 1, denied: 2 }, _prefix: :manager_evaluation

    scope :active, -> { where.not(manager_nomination_status: :denied, evaluator_nomination_status: :declined) }
    scope :managers, -> { joins(:relationship).where(relationships: { name: 'Manager', type: :global }) }
    scope :actual_by_options, lambda { |options|
      unless options.participants.dig('subject', 'can_evaluate_self')
        where('users_campaigns_assessments.subject_id != users_campaigns_assessments.evaluator_id')
      end
    }
  end
end

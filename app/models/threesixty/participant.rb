# frozen_string_literal: true

module Threesixty
  class Participant < UserAssessment
    self.inheritance_column = :disabled
    self.table_name = 'user_assessments'

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

    scope :active, -> { where.not(manager_nomination_status: :denied, evaluator_nomination_status: :declined) }
    scope :managers, -> { joins(:relationship).where(relationships: { name: 'Manager', type: :global }) }
  end
end

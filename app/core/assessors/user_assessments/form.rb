# frozen_string_literal: true

module Assessors
  module UserAssessments
    class Form < Rectify::Form
      attribute :subject_id, Integer
      attribute :evaluator_id, Integer
      attribute :assessment_id, Integer
      attribute :relationship_id, Integer
      attribute :campaign_id, Integer

      validates :subject_id, :assessment_id, :evaluator_id, :relationship_id, :campaign_id,
                presence: true

      validate :check_duplicate_assessment_and_subject_pair

      def check_duplicate_assessment_and_subject_pair
        if UserAssessment.exists?(attributes)
          errors.add(:base, I18n.t('activemodel.errors.models.user_assessment.subject_and_assessment_exists'))
        end
      end

      def evaluator_id
        context.assessor.user_id
      end

      def campaign_id
        context.campaign.id
      end

      def relationship_id
        Relationship.assessor_relationship.id
      end
    end
  end
end

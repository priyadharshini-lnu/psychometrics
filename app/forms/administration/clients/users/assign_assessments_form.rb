# frozen_string_literal: true

module Administration
  module Clients
    module Users
      class AssignAssessmentsForm < Rectify::Form
        # Fields
        attribute :assessment_ids, Array[Integer]

        #   VALIDATIONS
        #
        validate :assessments_assigned_to_client
        validate :assessments_uniqueness

        protected

        # Returns error if Assessment is not yet assigned to Client
        #
        def assessments_assigned_to_client
          errors.add(:assessment_ids, :invalid) unless (assessment_ids - context.client_assessment_ids).blank?
        end

        # Returns error if there is at least one already assigned Assessment
        #
        def assessments_uniqueness
          errors.add(:assessment_ids, :taken) unless (assessment_ids & context.membership_assessment_ids).blank?
        end
      end
    end
  end
end

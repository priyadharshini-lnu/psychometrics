# frozen_string_literal: true

module Administration
  module Clients
    class AssignAssessmentsForm < Rectify::Form
      # Fields
      attribute :assessment_ids, Array[Integer]
      attribute :apply_to_existing_users, Boolean

      #   VALIDATIONS
      #
      validates :assessment_ids, presence: true
      validate :assessments_owned_by_client
      validate :assessments_uniqueness
      validate :assessments_is_enabled

      # Rejects from an array a blank items
      #
      def assessment_ids=(ids)
        super(ids.reject(&:blank?))
      end

      protected

      # Returns error if there is Assessment where Client is not owner
      #
      def assessments_owned_by_client
        errors.add(:assessment_ids, :invalid) if ::Assessment.where(id: assessment_ids).
                                                 where.not(owner: context.owner).
                                                 exists?
      end

      # Returns error if there is at least one already assigned Assessment
      #
      def assessments_uniqueness
        errors.add(:assessment_ids, :taken) if context.client.assessments.exists?(id: assessment_ids)
      end

      # Returns error if there is at least one disabled Assessment
      #
      def assessments_is_enabled
        errors.add(:assessment_ids, :invalid) if ::Assessment.disabled.exists?(id: assessment_ids)
      end
    end
  end
end

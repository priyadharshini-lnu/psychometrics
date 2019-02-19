# frozen_string_literal: true

module Administration
  module Clients
    class EditAssessmentsClientForm < Rectify::Form
      # Fields
      attribute :assessments_client_ids, Array[Integer], nullify_blank: true
      attribute :remove_assessment_ids, Array[Integer], nullify_blank: true

      #   VALIDATIONS
      #
      validate :assessments_can_be_removed, unless: -> { remove_assessment_ids.blank? }

      protected

      # Returns error if assigned Assessment depends on Report
      #
      def assessments_can_be_removed
        assessment_report_ids = Report.joins(:assessments).where(assessments: { id: remove_assessment_ids }).ids

        errors.add(:remove_assessment_ids, :invalid) unless (context.client.report_ids & assessment_report_ids).blank?
      end
    end
  end
end

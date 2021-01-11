# frozen_string_literal: true

module Exports
  module Assessments
    class AgileAssessmentResultsExport < BaseAgileAssessmentResultsExport
      private_attr_accessor :assessment, :client_id

      def initialize(assessment, client_id)
        @client_id = client_id
        @assessment = assessment
      end

      def call
        broadcast :ok, get_xlsx_export_result
      end

      private

      def result_details_row_values(res)
        [
          res.encode_id,
          res.membership.client.name,
          res.user.first_name,
          res.user.last_name,
          res.user.email,
          res.assessment_id,
          res.completed_at.try(:strftime, '%D %r'),
          res.assessment.name,
          ''
        ]
      end

      def results
        Assign.joins(membership: %i[client user]).includes(
          %i[user assessment], membership: %i[client user]
        ).where(
          'assessment_id = (?) and assigns.status IN (?) and memberships.client_id = (?)',
          assessment.id, [1, 2], client_id
        )
      end
    end
  end
end

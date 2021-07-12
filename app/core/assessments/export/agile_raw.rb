# frozen_string_literal: true

module Assessments
  module Export
    class AgileRaw < Exports::Assessments::BaseAgileAssessmentResultsExport
      private_attr_accessor :assessment, :campaign

      def initialize(assessment, campaign)
        @assessment = assessment
        @campaign = campaign
      end

      def call
        broadcast :ok, get_xlsx_export_result
      end

      private

      def result_details_row_values(res)
        [
          res.encoded_id,
          campaign.name,
          res.subject.first_name,
          res.subject.last_name,
          res.subject.email,
          @assessment.id,
          res.completed_at.try(:strftime, '%D %r'),
          @assessment.name,
          ''
        ]
      end

      def results
        UsersResult.includes(:user_assessment, :subject).
          where(user_assessments: { campaign_id: campaign.id, assessment_id: assessment.id })
      end
    end
  end
end

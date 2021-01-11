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
          res.campaign.name,
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
        UsersResult.joins(:user_assessment).
          where(assessment_id: assessment.id, user_assessments: { campaign_id: campaign.id })
      end
    end
  end
end

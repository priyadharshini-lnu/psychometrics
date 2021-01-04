# frozen_string_literal: true

module Assessments
  module Export
    class RawAndScoring < Exports::Assessments::BaseAssessmentResultsExport
      private_attr_accessor :assessment, :campaign

      def initialize(assessment, campaign, options = {})
        @assessment = assessment
        @campaign = campaign
        @scoring = options[:scoring]
        @export_with_labels = options[:export_with_labels]
      end

      def call
        broadcast :ok, get_xlsx_export_result
      end

      private

      def get_result_details_header
        ['Result ID', 'Name', 'Email', 'Started At', 'Completed At', 'Norm', 'Status', 'Completion Reason']
      end

      def result_details_row_values(res)
        completion_reason =
          if res.completion_reason
            I18n.t("activerecord.attributes.users_result.completion_reasons.#{res.completion_reason}")
          end
        [
          res.encoded_id,
          user_name(res.evaluator.first_name, res.evaluator.last_name),
          res.evaluator.email,
          res.started_at.try(:strftime, '%D %r'),
          res.completed_at.try(:strftime, '%D %r'),
          res.norm ? res.norm.name : '',
          I18n.t("activerecord.attributes.users_result.statuses.#{res.status}"),
          completion_reason
        ]
      end

      def results
        UsersResult.joins(:user_assessment).
          where(assessment_id: assessment.id, user_assessments: { campaign_id: campaign.id }).
          includes(:evaluator, :norm)
      end
    end
  end
end

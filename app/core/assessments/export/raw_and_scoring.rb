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
        ['Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
         'Relationship', 'Started At', 'Completed At', 'Norm', 'Status', 'Completion Reason']
      end

      def result_details_row_values(res)
        completion_reason =
          if res.completion_reason
            I18n.t("activerecord.attributes.users_result.completion_reasons.#{res.completion_reason}")
          end
        [
          res.encoded_id,
          user_name(res.subject.first_name, res.subject.last_name),
          res.subject.email,
          user_name(res.evaluator.first_name, res.evaluator.last_name),
          res.evaluator.email,
          res.user_assessment.relationship.name,
          res.user_assessment.started_at.try(:strftime, '%D %r'),
          res.completed_at.try(:strftime, '%D %r'),
          res.norm ? res.norm.name : '',
          I18n.t("activerecord.attributes.users_result.statuses.#{res.real_status}"),
          completion_reason
        ]
      end

      def results
        UsersResult.joins(:user_assessment).
          where(user_assessments: { assessment_id: assessment.id, campaign_id: campaign.id }).
          includes(:norm, :subject, :evaluator, user_assessment: %i[relationship])
      end
    end
  end
end

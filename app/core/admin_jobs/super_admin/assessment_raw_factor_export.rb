# frozen_string_literal: true

module AdminJobs
  module SuperAdmin
    class AssessmentRawFactorExport < BaseExportAssessment
      private

      def headers
        factor_names = factors.map(&:name)
        [
          'Result ID', 'Project ID', 'Project Name', 'Campaign ID', 'Campaign Name',
          'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
          'Relationship', 'Started At', 'Completed At', 'Score Calculated At', 'Status', *factor_names
        ]
      end

      def data_row(user_result)
        raw_scores = factors.map do |factor|
          user_result.scoring&.dig(factor.id.to_s, 'score')
        end
        [
          user_result.encoded_id,
          user_result.campaign.project.id,
          user_result.campaign.project.name,
          user_result.campaign.id,
          user_result.campaign.name,
          user_name(user_result.subject.first_name, user_result.subject.last_name),
          user_result.subject.email,
          user_name(user_result.evaluator.first_name, user_result.evaluator.last_name),
          user_result.evaluator.email,
          user_result.user_assessment.relationship.name,
          user_result.created_at.to_s,
          user_result.completed_at.to_s,
          user_result.user_assessment.score_calculated_at.to_s,
          I18n.t("activerecord.attributes.users_result.statuses.#{user_result.real_status}"),
          *raw_scores
        ]
      end

      def records_for_export
        UsersResult.geo_scoped(owner_country).
          joins(:user_assessment).
          where(
            user_assessments: {
              assessment_id: assessment.id,
              campaign_id: filtered_campaign_ids
            }
          ).
          merge(UserAssessment.scored).
          includes(:norm, :subject, :evaluator, user_assessment: %i[relationship]).
          find_each(batch_size: 100)
      end

      def factors
        @factors ||= assessment.dimension.all_factors.active.select(:name, :id).to_a
      end

      def file_name
        "assessment-#{assessment.id}-raw-factor-scores-#{record.id}.csv"
      end
    end
  end
end

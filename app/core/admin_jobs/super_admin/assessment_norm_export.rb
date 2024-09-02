# frozen_string_literal: true

module AdminJobs
  module SuperAdmin
    class AssessmentNormExport < BaseExportAssessment
      private

      def headers
        factor_names = factors.map(&:name)
        [
          'Result ID', 'Project ID', 'Project Name', 'Campaign ID', 'Campaign Name',
          'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
          'Relationship', 'Started At', 'Completed At', 'Score Calculated At', 'Norm', 'Status', *factor_names
        ]
      end

      def data_row(user_result)
        norm_scores = []
        factors.each do |factor|
          norm_scores << user_result.scoring&.dig(factor.id.to_s, 'norm_score')
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
          user_result.norm ? user_result.norm.name : '',
          I18n.t("activerecord.attributes.users_result.statuses.#{user_result.real_status}"),
          *norm_scores
        ]
      end

      def records_for_export
        query = UsersResult.joins(:user_assessment).
                where(user_assessments: { assessment_id: assessment.id }).
                merge(UserAssessment.scored)

        if campaign_ids.present?
          query = query.where(user_assessments: { campaign_id: campaign_ids })
        end
        query.includes(:norm, :subject, :evaluator, user_assessment: %i[relationship]).
          find_each(batch_size: 100)
      end

      def factors
        @factors ||= assessment.dimension.all_factors.active.select(:name, :id).to_a
      end

      def file_name
        "assessment-#{assessment.id}-normed-results-#{record.id}.csv"
      end
    end
  end
end

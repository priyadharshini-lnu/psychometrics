# frozen_string_literal: true

module Administration
  module Assessors
    class ParticipantSerializer < Panko::Serializer
      attributes :id, :campaign_id, :campaign_name, :project_name,
                 :candidate_name, :candidate_email,
                 :evaluation_status, :evaluation_completed, :evaluation_total,
                 :moderation_status

      def id
        object.subject_id
      end

      def project_name
        context.dig(:project_names, object.campaign_project_id) || ''
      end

      def candidate_name
        "#{object.candidate_first_name} #{object.candidate_last_name}".strip
      end

      def evaluation_status
        ::Assessors::GetStatusFromCounts.call!(evaluation_counts).to_s
      end

      def evaluation_completed
        evaluation_counts[:completed]
      end

      def evaluation_total
        evaluation_counts[:total]
      end

      def moderation_status
        counts = context.dig(:moderation_statuses, object.campaign_id, object.subject_id) || default_counts

        ::Assessors::GetStatusFromCounts.call!(counts).to_s
      end

      private

      def evaluation_counts
        context.dig(:evaluations_count, object.campaign_id, object.subject_id) || default_counts
      end

      def default_counts
        UserAssessment.statuses_count.merge(total: 0)
      end
    end
  end
end

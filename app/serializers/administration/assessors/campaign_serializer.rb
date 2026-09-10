# frozen_string_literal: true

module Administration
  module Assessors
    class CampaignSerializer < Panko::Serializer
      attributes :id, :name, :client_name, :project_name, :start_date, :end_date, :status,
                 :total_subjects_count, :evaluation_completion_status,
                 :completed_subject_evaluation_count, :total_subject_evaluation_count,
                 :completed_subject_moderation_count, :total_subject_moderation_count,
                 :moderation_completion_status

      def client_name
        object.client.name
      end

      def project_name
        object.project.name
      end

      def total_subjects_count
        context.dig(:total_subjects_count, object.id) || 0
      end

      def evaluation_completion_status
        ::Assessors::GetStatusFromCounts.call!(subject_evaluation_statuses_count)
      end

      def moderation_completion_status
        ::Assessors::GetStatusFromCounts.call!(subject_moderation_statuses_count)
      end

      def completed_subject_evaluation_count
        subject_evaluation_statuses_count[:completed]
      end

      def total_subject_evaluation_count
        subject_evaluation_statuses_count[:total]
      end

      def completed_subject_moderation_count
        subject_moderation_statuses_count[:completed]
      end

      def total_subject_moderation_count
        subject_moderation_statuses_count[:total]
      end

      private

      def subject_evaluation_statuses_count
        context.dig(:subject_evaluation_statuses_count, object.id) || UserAssessment.statuses_count.merge(total: 0)
      end

      def subject_moderation_statuses_count
        context.dig(:subject_moderation_statuses_count, object.id) || UserAssessment.statuses_count.merge(total: 0)
      end
    end
  end
end

# frozen_string_literal: true

module Administration
  module Assessors
    class CampaignSerializer < Panko::Serializer
      attributes :id, :name, :start_date, :end_date, :status, :completion_status,
                 :completed_subject_count, :total_subject_count

      def completion_status
        ::Assessors::GetStatusFromCounts.call!(subject_status_count)
      end

      def completed_subject_count
        subject_status_count[:completed]
      end

      def total_subject_count
        subject_status_count[:total]
      end

      private

      def subject_status_count
        context.dig(:subject_statuses_count, object.id) || { total: 0, completed: 0, in_progress: 0 }
      end
    end
  end
end

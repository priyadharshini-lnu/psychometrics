# frozen_string_literal: true

module Administration
  module Assessors
    class UserSerializer < Panko::Serializer
      attributes :id, :email, :full_name, :total_evaluations, :completed_evaluations, :completion_status, :permissions,
                 :assessor_can_moderate_scores

      def full_name
        object.decorate.full_name
      end

      def completion_status
        ::Assessors::GetStatusFromCounts.call!(evaluation_count)
      end

      def total_evaluations
        evaluation_count[:total]
      end

      def completed_evaluations
        evaluation_count[:completed]
      end

      def assessor_can_moderate_scores
        ::Users::GetLeadAssessor.call!(context[:campaign], object) == current_user
      end

      def permissions
        GetPermissionsHash.call!(
          Administration::Campaigns::AssessorPolicy,
          current_user,
          object,
          [
            'add_subject',
            %w[remove_subject destroy]
          ],
          {
            project_id: context[:project_id],
            campaign_id: context[:campaign_id]
          }
        )
      end

      private

      def current_user
        context[:current_user]
      end

      def evaluation_count
        context.dig(:evaluations_count, object.id) || { total: 0, completed: 0, in_progress: 0 }
      end
    end
  end
end

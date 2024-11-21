# frozen_string_literal: true

module Administration
  module Assessors
    class UserSerializer < Panko::Serializer
      attributes :id, :email, :full_name, :total_evaluations, :completed_evaluations, :permissions,
                 :assessor_can_moderate_scores, :evaluation_completion_status, :moderation_completion_status,
                 :total_moderation, :completed_moderation

      def full_name
        object.decorate.full_name
      end

      def evaluation_completion_status
        ::Assessors::GetStatusFromCounts.call!(evaluation_count)
      end

      def moderation_completion_status
        ::Assessors::GetStatusFromCounts.call!(moderation_count)
      end

      def total_evaluations
        evaluation_count[:total]
      end

      def completed_evaluations
        evaluation_count[:completed]
      end

      def total_moderation
        moderation_count[:total]
      end

      def completed_moderation
        moderation_count[:completed]
      end

      def assessor_can_moderate_scores
        lead_user_assessment = UserAssessments::GetLeadUserAssessmentForSubject.call!(context[:campaign], object)

        lead_user_assessment&.evaluator == current_user
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
        context.dig(:evaluations_count, object.id) || UserAssessment.statuses_count.merge(total: 0)
      end

      def moderation_count
        context.dig(:moderation_count, object.id) || UserAssessment.statuses_count.merge(total: 0)
      end
    end
  end
end

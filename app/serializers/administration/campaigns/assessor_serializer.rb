# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessorSerializer < Panko::Serializer
      attributes :id, :full_name, :email, :permissions,
                 :status, :total_evaluations, :completed_evaluations, :workshop_assessors_count

      delegate :email, to: :user

      def full_name
        user.decorate.full_name
      end

      def status
        return :completed if total_evaluations == completed_evaluations

        :not_completed
      end

      def total_evaluations
        evalutions_count[:total]
      end

      def completed_evaluations
        evalutions_count[:completed]
      end

      def permissions
        GetPermissionsHash.call!(
          Administration::Campaigns::AssessorPolicy,
          current_user,
          object,
          [
            %w[remove destroy],
            %w[login_as spoof]
          ],
          {
            project_id: context[:project_id],
            campaign_id: context[:campaign_id]
          }
        )
      end

      def workshop_assessors_count
        context[:workshop_assessors_count][object.user_id] || 0
      end

      private

      def evalutions_count
        context[:evalutions_count][object.user_id] || { total: 0, completed: 0 }
      end

      def current_user
        context[:current_user]
      end

      def user
        object.user
      end
    end
  end
end

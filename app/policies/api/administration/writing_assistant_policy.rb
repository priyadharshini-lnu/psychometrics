# frozen_string_literal: true

module Api
  module Administration
    class WritingAssistantPolicy < ::Administration::BasePolicy
      def assist?
        user.admin? || user.assessor?
      end

      def admin?
        @user.is?(:superadmin, :client_admin, :project_admin, :campaign_admin)
      end
    end
  end
end

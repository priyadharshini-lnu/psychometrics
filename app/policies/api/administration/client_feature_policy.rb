# frozen_string_literal: true

module Api
  module Administration
    class ClientFeaturePolicy < Administration::BasePolicy
      def update?
        @user.is?(:superadmin)
      end

      def index?
        @user.is?(:superadmin) || @user.has_grant?(:project_settings, :feature_flags)
      end

      def migrate_communication_center?
        @user.support_admin?
      end
    end
  end
end

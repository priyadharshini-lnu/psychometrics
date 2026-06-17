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
    end
  end
end

# frozen_string_literal: true

module Api
  module Administration
    class UserIdpPlanPolicy < ::Api::Administration::BasePolicy
      def create?
        @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)
      end
    end
  end
end

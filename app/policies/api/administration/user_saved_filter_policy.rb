# frozen_string_literal: true

module Api
  module Administration
    class UserSavedFilterPolicy < BasePolicy
      def index?
        admin?
      end

      def create?
        admin?
      end

      def update?
        admin?
      end

      def destroy?
        admin?
      end

      def admin?
        @user.is?(:superadmin, :client_admin, :project_admin, :campaign_admin)
      end

      class Scope < Administration::BasePolicy::Scope
        def resolve
          scope.where(user_id: @user.id)
        end
      end
    end
  end
end

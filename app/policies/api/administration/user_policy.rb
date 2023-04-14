# frozen_string_literal: true

module Api
  module Administration
    class UserPolicy < ::Administration::UserPolicy
      def show?
        @user.is?(:superadmin) || @user.has_grant?(:projects, :manage_users)
      end

      def reset_password?
        return true if @user.is?(:superadmin)
        return false unless @record.is?(:regular)

        @user.has_permission?(:users, :reset_password, project_id: @record.project_id)
      end

      class Scope < Scope
        def resolve
          ::Administration::UserPolicy::Scope.new(user, ::User).resolve
        end
      end
    end
  end
end

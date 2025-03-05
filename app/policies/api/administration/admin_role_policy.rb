# frozen_string_literal: true

module Api
  module Administration
    class AdminRolePolicy < ::Administration::BasePolicy
      def index?
        @user.superadmin?
      end

      def show?
        @user.superadmin?
      end

      def create?
        @user.superadmin?
      end

      def update?
        @user.superadmin?
      end

      def destroy?
        @user.superadmin?
      end

      class Scope < BasePolicy::Scope
        def resolve
          scope if @user.superadmin?
        end
      end
    end
  end
end

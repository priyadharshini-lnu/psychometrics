# frozen_string_literal: true

module Api
  module Administration
    class ApplicationPolicy < ::Administration::BasePolicy
      def index?
        @user.superadmin?
      end

      def create?
        @user.superadmin?
      end

      def activate?
        @user.superadmin?
      end

      def deactivate?
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

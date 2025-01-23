# frozen_string_literal: true

module Api
  module Administration
    class SkillPolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin)
      end

      def create?
        @user.is?(:superadmin)
      end

      def update?
        @user.is?(:superadmin)
      end

      def destroy?
        @user.is?(:superadmin)
      end

      def show?
        @user.is?(:superadmin)
      end

      def add_tag?
        @user.is?(:superadmin)
      end

      def remove_tag?
        @user.is?(:superadmin)
      end

      class Scope < BasePolicy::Scope
        def resolve
          return scope if @user.superadmin?
        end
      end
    end
  end
end

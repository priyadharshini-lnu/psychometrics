# frozen_string_literal: true

module Api
  module Administration
    class QuestionPolicy < ::Api::Administration::BasePolicy
      def index?
        @user.is?(:superadmin) || has_permission?('questions', 'view')
      end

      def show?
        index?
      end

      def create?
        @user.is?(:superadmin) || has_permission?('questions', 'manage')
      end

      def update?
        can_manage_question?
      end

      def destroy?
        can_manage_question?
      end

      def copy?
        can_manage_question?
      end

      def toggle_status?
        can_manage_question?
      end

      private

      def can_manage_question?
        @user.is?(:superadmin) || has_permission?('questions', 'manage', project_id: @record&.owner_id)
      end

      class Scope < BasePolicy::Scope
        def resolve
          scope
        end
      end
    end
  end
end

# frozen_string_literal: true

module Api
  module Administration
    class BlockPolicy < ::Api::Administration::BasePolicy
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
        can_manage_block?
      end

      def destroy?
        can_manage_block?
      end

      def copy?
        can_manage_block?
      end

      def toggle_status?
        can_manage_block?
      end

      private

      def can_manage_block?
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

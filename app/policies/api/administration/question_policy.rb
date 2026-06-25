# frozen_string_literal: true

module Api
  module Administration
    class QuestionPolicy < ::Api::Administration::BasePolicy
      def index?
        return has_permission?(:questions, :view, project_id: project_id) if project_id.present?

        user.has_grant?(:questions, :view)
      end

      def show?
        return has_permission?(:questions, :view, project_id: record_owner_id) if record_owner_id

        index?
      end

      def create?
        can_manage_question?
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

      def record_owner_id
        return if @record.is_a?(Class)

        @record&.owner_id
      end

      def can_manage_question?
        return has_permission?(:questions, :manage, project_id: record_owner_id) if record_owner_id
        return has_permission?(:questions, :manage, project_id: project_id) if project_id.present?

        user.has_grant?(:questions, :manage)
      end

      class Scope < BasePolicy::Scope
        def resolve
          scope = super
          return scope if user.is?(:superadmin)

          owner_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_clients_tte_ids

          permitted_owner_ids = owner_ids.uniq.select do |owner_id|
            @user.has_permission?(:questions, :view, project_id: owner_id)
          end

          return scope.where(owner_id: permitted_owner_ids) if @user.is?(:client_admin)

          scope.where(owner_id: permitted_owner_ids.push(nil))
        end
      end
    end
  end
end

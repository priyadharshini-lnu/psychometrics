# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessorPolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin) || @user.has_client_grant?(:assessors, :view, @project_id)
      end

      def available_assessments?
        @user.is?(:superadmin) || @user.has_client_grant?(:assessors, :view, @project_id)
      end

      def create_all?
        @user.is?(:superadmin) || (@user.has_client_grant?(:assessors, :manage, @project_id) &&
          @user.has_client_grant?(:campaigns, :manage_users, @project_id))
      end

      def destroy?
        @user.is?(:superadmin) || (@user.has_client_grant?(:assessors, :manage, @project_id) &&
          @user.has_client_grant?(:campaigns, :manage_users, @project_id))
      end

      def import?
        @user.is?(:superadmin) || (@user.has_client_grant?(:assessors, :manage, @project_id) &&
          @user.has_client_grant?(:campaigns, :manage_users, @project_id))
      end

      def show?
        @user.is?(:superadmin) || @user.has_client_grant?(:assessors, :view, @project_id)
      end

      def user_assessments?
        @user.is?(:superadmin) || @user.has_client_grant?(:assessors, :view, @project_id)
      end

      def spoof?
        @user.is?(:superadmin)
      end

      def reset_evaluation?
        @user.is?(:superadmin) || (@user.has_client_grant?(:assessors, :manage, @project_id) &&
          @user.has_client_grant?(:campaigns, :manage_users, @project_id))
      end

      def add_subject?
        @user.is?(:superadmin) || (@user.has_client_grant?(:assessors, :manage, @project_id) &&
          @user.has_client_grant?(:campaigns, :manage_users, @project_id))
      end
    end
  end
end

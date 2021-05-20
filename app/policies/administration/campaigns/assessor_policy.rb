# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessorPolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin) || @user.has_grant?(:assessors, :view)
      end

      def available_assessments?
        @user.is?(:superadmin) || @user.has_grant?(:assessors, :view)
      end

      def create_all?
        @user.is?(:superadmin) || (@user.has_grant?(:assessors, :manage) &&
          @user.has_grant?(:campaigns, :manage_users))
      end

      def destroy?
        @user.is?(:superadmin) || (@user.has_grant?(:assessors, :manage) &&
          @user.has_grant?(:campaigns, :manage_users))
      end

      def import?
        @user.is?(:superadmin) || (@user.has_grant?(:assessors, :manage) &&
          @user.has_grant?(:campaigns, :manage_users))
      end

      def show?
        @user.is?(:superadmin) || @user.has_grant?(:assessors, :view)
      end

      def user_assessments?
        @user.is?(:superadmin) || @user.has_grant?(:assessors, :view)
      end

      def spoof?
        @user.is?(:superadmin)
      end

      def reset_evaluation?
        @user.is?(:superadmin) || (@user.has_grant?(:assessors, :manage) &&
          @user.has_grant?(:campaigns, :manage_users))
      end

      def add_subject?
        @user.is?(:superadmin) || (@user.has_grant?(:assessors, :manage) &&
          @user.has_grant?(:campaigns, :manage_users))
      end
    end
  end
end

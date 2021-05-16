# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessorPolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin) || @user.has_grant?(:assessors, :view)
      end

      def available_assessments?
        index?
      end

      def create_all?
        @user.is?(:superadmin) || (@user.has_grant?(:assessors, :manage) &&
          @user.has_grant?(:campaigns, :manage_users))
      end

      def destroy?
        create_all?
      end

      def import?
        create_all?
      end

      def show?
        index?
      end

      def user_assessments?
        index?
      end

      def spoof?
        @user.is?(:superadmin)
      end

      def reset_evaluation?
        add_subject?
      end

      def add_subject?
        @user.is?(:superadmin) || (@user.has_grant?(:assessors, :manage) &&
          @user.has_grant?(:campaigns, :manage_users))
      end
    end
  end
end

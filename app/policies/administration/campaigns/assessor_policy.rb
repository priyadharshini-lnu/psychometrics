# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessorPolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin, :client_admin, :project_admin)
      end

      def available_assessments?
        index?
      end

      def create_all?
        index?
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
    end
  end
end

# frozen_string_literal: true

module Api
  module Administration
    class DashboardPolicy < ::Api::Administration::BasePolicy
      def index?
        manage_dashboard?
      end

      def create?
        manage_dashboard?
      end

      def update?
        manage_dashboard?
      end

      def create_with_campaign?(_)
        manage_dashboard?
      end

      private

      def manage_dashboard?
        user.is?(:superadmin)
      end
    end
  end
end

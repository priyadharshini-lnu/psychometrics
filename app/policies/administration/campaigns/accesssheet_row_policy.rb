# frozen_string_literal: true

module Administration
  module Campaigns
    class AccesssheetRowPolicy < Administration::BasePolicy
      def create?
        manage?
      end

      def edit?
        manage?
      end

      def index?
        view?
      end

      def show?
        view?
      end

      def update?
        manage?
      end

      def destroy?
        manage?
      end

      def import?
        manage?
      end

      def export?
        view?
      end

      def bulk_delete?
        manage?
      end

      private

      def manage?
        has_permission?(:dashboards, :accesssheet_manage)
      end

      def view?
        has_permission?(:dashboards, :accesssheet_view)
      end
    end
  end
end

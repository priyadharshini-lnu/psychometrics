# frozen_string_literal: true

module Api
  module Administration
    class MettlScheduleRecordPolicy < ::Administration::BasePolicy
      def index?
        can_manage_integrations?
      end

      def update?
        can_manage_integrations?
      end

      private

      def can_manage_integrations?
        has_permission?(:project_settings, :integrations)
      end
    end
  end
end

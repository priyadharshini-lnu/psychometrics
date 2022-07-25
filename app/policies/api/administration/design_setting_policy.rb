# frozen_string_literal: true

module Api
  module Administration
    class DesignSettingPolicy < ::Administration::BasePolicy
      def index?
        manage_design_settings?
      end

      def update?
        manage_design_settings?
      end

      private

      def manage_design_settings?
        @user.has_permission?(:project_settings, :design)
      end
    end
  end
end

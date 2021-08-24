# frozen_string_literal: true

module Administration
  module Projects
    class SmtpSettingsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update]

      def update
      end

      private

      def resource_class
        @resource_class ||= ::SmtpSetting
      end
    end
  end
end
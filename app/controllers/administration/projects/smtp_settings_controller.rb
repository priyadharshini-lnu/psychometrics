# frozen_string_literal: true

module Administration
  module Projects
    class SmtpSettingsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update]

      def update
        form = SmtpSettings::Form.from_params(resource_params)
        if form.valid?
          project.smtp_setting.update(form.attributes.except(:authentication))
          head :ok
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      private

      def resource_class
        @resource_class ||= ::SmtpSetting
      end
    end
  end
end

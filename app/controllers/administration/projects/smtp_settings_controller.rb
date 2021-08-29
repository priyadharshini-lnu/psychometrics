# frozen_string_literal: true

module Administration
  module Projects
    class SmtpSettingsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update]

      def update
        form = SmtpSettings::Form.from_params(resource_params)
        if form.valid?
          project.smtp_setting.update(form.attributes)
          render json: project.smtp_setting, serializer: ::Administration::Projects::SmtpSettingSerializer
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def validate_settings
        form = SmtpSettings::Form.from_params(resource_params)
        if form.valid?
          head :ok
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def send_test_email
        form = ::EmailTest::Form.from_params(params)
        smtp_attributes = SmtpSettings::Form.from_params(params).attributes
        if form.valid?
          SmtpSettingMailer.test_email(smtp_attributes, form.to_email).deliver_later
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

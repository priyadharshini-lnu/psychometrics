# frozen_string_literal: true

module Administration
  module Projects
    class SmtpSettingsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update send_test_email]

      def update
        form = SmtpSettings::Form.from_params(resource_params)
        if form.valid?
          project.smtp_setting.update(form.attributes.except(:authentication))
          render json: project.smtp_setting, serializer: ::Administration::Projects::SmtpSettingSerializer
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def send_test_email
        form = ::EmailTest::Form.from_params(params)
        if form.valid?
          SmtpSettingMailer.test_email(resource, form.to_email).deliver_later
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: :bad_request
        end
      end

      private

      def resource_class
        @resource_class ||= ::SmtpSetting
      end
    end
  end
end

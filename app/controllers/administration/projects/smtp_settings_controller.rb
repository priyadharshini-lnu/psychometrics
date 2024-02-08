# frozen_string_literal: true

module Administration
  module Projects
    class SmtpSettingsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update]

      def update
        form = SmtpSettings::Form.from_params(smtp_setting_params)
        if form.valid?
          project.smtp_setting.update(form.attributes)
          render json: ::Administration::Projects::SmtpSettingSerializer.new.serialize(project.smtp_setting)
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def validate_settings
        form = SmtpSettings::Form.from_params(smtp_setting_params)
        if form.valid?
          head :ok
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def send_test_email
        form = ::EmailTest::Form.from_params(params)
        smtp_attributes = SmtpSettings::Form.from_params(smtp_setting_params).attributes
        if form.valid?
          error = nil
          begin
            SmtpSettingMailer.test_email(smtp_attributes, form.to_email).deliver_now!
          rescue SocketError, Net::OpenTimeout, OpenSSL::SSL::SSLError
            error = I18n.t('administration.smtp_settings.errors.host_unreachable')
          rescue Net::SMTPAuthenticationError
            error = I18n.t('administration.smtp_settings.errors.authentication_failed')
          rescue StandardError => e
            error = e.message
          end
          return render json: { errors: error }, status: 422 if error

          head :ok
        else
          render json: { errors: form.errors[:to_email] }, status: 422
        end
      end

      private

      def smtp_setting_params
        new_params = resource_params
        new_params[:password] = project.smtp_setting.password if new_params[:password].blank?
        new_params
      end

      def resource_class
        @resource_class ||= ::SmtpSetting
      end
    end
  end
end

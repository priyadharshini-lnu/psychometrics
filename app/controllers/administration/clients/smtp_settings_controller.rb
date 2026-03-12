# frozen_string_literal: true

module Administration
  module Clients
    class SmtpSettingsController < Administration::BaseController
      before_action :set_client

      before_action :ensure_smtp_setting, only: %i[show update]

      def show
        render json: serializer.new.serialize(client.smtp_setting)
      end

      def update
        form = SmtpSettings::Form.from_params(smtp_setting_params)
        if form.valid?
          client.smtp_setting.update(form.attributes)
          render json: serializer.new.serialize(client.smtp_setting)
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
          result = send_email(form.to_email, smtp_attributes)
          return render json: { errors: result[:error] }, status: 422 if result[:error]

          head :ok
        else
          render json: { errors: form.errors[:to_email] }, status: 422
        end
      end

      private

      attr_reader :client

      def set_client
        @client = policy_scope(Client).find(params[:client_id])
        authorize @client, :edit?
      end

      def ensure_smtp_setting
        client.create_smtp_setting if client.smtp_setting.nil?
      end

      def send_email(email_id, smtp_setting)
        error = nil
        begin
          SmtpSettingMailer.test_email(smtp_setting, email_id).deliver_now!
        rescue SocketError, Net::OpenTimeout, OpenSSL::SSL::SSLError
          error = I18n.t('administration.smtp_settings.errors.host_unreachable')
        rescue Net::SMTPAuthenticationError
          error = I18n.t('administration.smtp_settings.errors.authentication_failed')
        rescue StandardError => e
          Rails.logger.error("SMTP Settings check failed: #{e.message}")
          error = I18n.t('administration.smtp_settings.errors.general_failure',
                         default: 'Failed to connect. Please check your settings.')
        end
        { error: error }
      end

      def smtp_setting_params
        new_params = params[:resource] || ActionController::Parameters.new
        if client.smtp_setting && new_params[:password].blank?
          new_params[:password] = client.smtp_setting.password
        end
        new_params.permit!
      end

      def serializer
        ::Administration::Clients::SmtpSettingSerializer
      end
    end
  end
end

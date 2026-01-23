# frozen_string_literal: true

require 'socket'

module SiemLogger
  EVENT_MAPPINGS = {
    'LoginSuccessful' => '4624',
    'LoginFailure' => '4625',
    'SignOut' => '4634',
    'AccountLocked' => '4740',
    'UserProvision' => '4720',
    'UserDeprovision' => '4726',
    'AlterUser' => '4738',
    'UserSecurityContextChange' => '4670',
    'TokenIssuance' => '4696',
    'PasswordChange' => '4724',
    'ApplicationConfigurationChange' => '4657',
    'SensitiveOperation' => '4673',
    'MFAAuthenticationSuccess' => '4774',
    'MFAAuthenticationFailure' => '4775',
    'MFASecurityInformation' => '4911',
    'Impersonation' => '4648',
    'InputValidation' => '5060',
    'OutputValidation' => '5060',
    'SessionManagementExceptions' => '5060',
    'AuthorizationFailure' => '4663'
  }.freeze

  SEVERITY_MAPPINGS = {
    'LoginSuccessful' => 'Info',
    'LoginFailure' => 'Error',
    'SignOut' => 'Info',
    'AccountLocked' => 'Error',
    'UserProvision' => 'Info',
    'UserDeprovision' => 'Info',
    'AlterUser' => 'Info',
    'UserSecurityContextChange' => 'Info',
    'TokenIssuance' => 'Info',
    'PasswordChange' => 'Info',
    'ApplicationConfigurationChange' => 'Info',
    'SensitiveOperation' => 'Info',
    'MFAAuthenticationSuccess' => 'Info',
    'MFAAuthenticationFailure' => 'Error',
    'MFASecurityInformation' => 'Info',
    'Impersonation' => 'Info',
    'InputValidation' => 'Error',
    'OutputValidation' => 'Error',
    'SessionManagementExceptions' => 'Error',
    'AuthorizationFailure' => 'Error'
  }.freeze

  class << self
    def log_security_event!(event_name, options = {})
      unless EVENT_MAPPINGS.key?(event_name)
        error_msg = "Unknown event name: #{event_name}. Must be one of: #{EVENT_MAPPINGS.keys.join(', ')}"

        raise ArgumentError, error_msg
      end

      payload = build_mmc_log_entry(event_name, options)

      LOGGER.info(payload)
    end

    def user_identifier(email, user_id = nil)
      if Settings.features.dont_send_pi_to_siem
        (user_id || 'REDACTED').to_s
      else
        email.to_s
      end
    end

    def build_request_details(request, identity_provider = nil)
      safe_url = begin
        request.url
      rescue StandardError
        nil
      end

      {
        ip: request.remote_ip,
        request_id: request.env['action_dispatch.request_id'],
        url: safe_url,
        identity_provider: identity_provider
      }
    end

    private

    def build_mmc_log_entry(event_name, options) # rubocop:disable Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
      {
        'EventName' => event_name,
        'EventID' => EVENT_MAPPINGS[event_name],
        'EventType' => 'MMC-Security',
        'Severity' => SEVERITY_MAPPINGS[event_name],
        'Timestamp' => Time.current.utc.strftime('%Y-%m-%dT%H:%M:%S.%3NZ'),
        'ClientIPAddress' => options.dig(:request_details, :ip) || Current.ip_address || '0.0.0.0',
        'Location' => determine_location(options),
        'ApplicationCode' => Settings.application_code,
        'ApplicationComponent' => determine_app_component(options),
        'ActorName' => (options[:actor_name] || 'Anonymous').to_s,
        'Context' => options[:context] || 'NoContext',
        'Msg' => options[:msg] || options[:failure_reason] || 'NoMessage',
        'IdentityProvider' => (options.dig(:request_details, :identity_provider) || '').to_s,
        'ApplicationInstance' => scrub_url(options.dig(:request_details,
                                                       :url)).presence || ENV['APP_DOMAIN'].to_s,
        'ActingAsUser' => options[:acting_as_user] || '',
        'AuthenticationChannel' => options[:authentication_channel] || '',
        'TrackingNumber' => options[:tracking_number] || '',
        'SessionID' => (options[:session_id] || '').to_s,
        'CorrelationID' => options.dig(:request_details, :request_id) || Current.request_id || ''
      }
    end

    def determine_app_component(options)
      options[:application_component] || Current.application_component || 'Unknown'
    end

    def determine_location(options)
      url = options.dig(:request_details, :url) || Current.request_url
      return (ENV['APP_DOMAIN'] || '').to_s if url.blank?

      URI.parse(url).host || (ENV['APP_DOMAIN'] || '').to_s
    rescue URI::InvalidURIError
      (ENV['APP_DOMAIN'] || '').to_s
    end

    def scrub_url(url)
      return '' if url.blank?

      begin
        uri = URI.parse(url)

        return uri.to_s unless uri.query

        filter = ActiveSupport::ParameterFilter.new(Rails.application.config.filter_parameters)
        params = CGI.parse(uri.query)
        filtered_params = filter.filter(params)

        uri.query = URI.encode_www_form(filtered_params)
        uri.to_s
      rescue StandardError => e
        Rails.logger.warn("SiemLogger: Failed to scrub URL: #{e.message}")
        ''
      end
    end
  end
end

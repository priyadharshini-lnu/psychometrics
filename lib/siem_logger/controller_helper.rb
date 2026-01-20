# frozen_string_literal: true

module SiemLogger
  module ControllerHelper
    def siem_log_security_event!(event_name, options = {})
      options = enrich_with_request_context(options)
      SiemLogger.log_security_event!(event_name, options)
    end

    def siem_log_authentication_failure(auth_type, additional_tags: [])
      message = "#{auth_type.upcase} authentication failed - invalid token"

      channel = case auth_type
                  when 'sso' then 'API Based SSO'
                  when 'jwt' then 'JWT'
                  else auth_type
                end

      siem_log_security_event!('LoginFailure', {
        context: message,
        msg: message,
        authentication_channel: channel,
        request_details: { identity_provider: '' },
        tags: %w[auth_failure security_event] + additional_tags
      })
    end

    def siem_log_authentication_success(user, found_by, auth_details = {})
      channel = determine_authentication_channel_for_success(found_by)
      return unless channel

      actor = SiemLogger.user_identifier(user.email, user.id)
      context = "User #{actor} authenticated via #{channel}"
      message = "#{channel} authentication successful"

      siem_log_security_event!('LoginSuccessful', {
        context: context,
        msg: message,
        authentication_channel: channel,
        request_details: { identity_provider: auth_details[:identity_provider] || '' },
        actor_name: actor,
        session_id: user.id
      })
    end

    def siem_log_impersonation_event(target_user, current_user, role)
      admin_actor = SiemLogger.user_identifier(current_user.email, current_user.id)
      target_actor = SiemLogger.user_identifier(target_user.email, target_user.id)

      context = "Admin logged in as #{role}"
      message = "Admin #{admin_actor} Logged in as #{role} #{target_actor}"
      message += " ##{target_user.project_id}" if target_user.project_id.present?

      siem_log_security_event!('Impersonation', {
        actor_name: admin_actor,
        context: context,
        msg: message,
        acting_as_user: target_actor,
        session_id: target_user.id
      })
    end

    def siem_log_token_issuance(user, channel, context:, identity_provider: nil)
      actor = user ? SiemLogger.user_identifier(user.email, user.id) : nil

      siem_log_security_event!('TokenIssuance', {
        actor_name: actor,
        context: context,
        msg: "#{channel} token issued#{" for #{actor}" if actor}",
        authentication_channel: channel,
        request_details: { identity_provider: identity_provider },
        session_id: user&.id
      })
    end

    def siem_log_mfa_success(user)
      actor = SiemLogger.user_identifier(user.email, user.id)

      siem_log_security_event!('MFAAuthenticationSuccess', {
        context: "User: #{actor}",
        msg: "Two-factor authentication successful for #{actor}",
        authentication_channel: 'TwoFactor',
        actor_name: actor
      })
    end

    def siem_log_mfa_failure(user)
      actor = SiemLogger.user_identifier(user.email, user.id)

      siem_log_security_event!('MFAAuthenticationFailure', {
        context: "User: #{actor}",
        msg: "Two-factor authentication failed for #{actor}",
        authentication_channel: 'TwoFactor',
        actor_name: actor
      })
    end

    private

    def determine_authentication_channel_for_success(found_by)
      case found_by
        when :api_jwt, :lighthouse_jwt then 'JWT'
        when :sso then 'API Based SSO'
        else found_by.to_s.upcase
      end
    end

    def enrich_with_request_context(options)
      return options unless respond_to?(:request)

      request_details = SiemLogger.build_request_details(request, options.dig(:request_details, :identity_provider))
      options[:request_details] = request_details.merge(options[:request_details] || {})

      if respond_to?(:end_user_side?, true)
        options[:application_component] = end_user_side? ? 'end_user' : 'admin'
      end

      options
    end
  end
end

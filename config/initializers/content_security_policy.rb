# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# Define an application-wide content security policy.
# See the Securing Rails Applications Guide for more information:
# https://guides.rubyonrails.org/security.html#content-security-policy-header

# Rails.application.configure do
#   config.content_security_policy do |policy|
#     policy.default_src :self, :https
#     policy.font_src    :self, :https, :data
#     policy.img_src     :self, :https, :data
#     policy.object_src  :none
#     policy.script_src  :self, :https
#     policy.style_src   :self, :https
#     # Specify URI for violation reports
#     # policy.report_uri "/csp-violation-report-endpoint"
#   end
#
#
#   # Report violations without enforcing the policy.
#   # config.content_security_policy_report_only = true
# end

unless Rails.env.test?
  # rubocop:disable Metrics/BlockLength
  Rails.application.configure do
    config.content_security_policy_report_only = ENV.fetch('CSP_REPORT_ONLY', 'false') == 'true'
    config.content_security_policy_nonce_generator = ->(_) { SecureRandom.base64(16) }
    config.content_security_policy_nonce_directives = %w[script-src]

    config.content_security_policy do |policy|
      protocol = Settings.protocol
      vite_domain = "#{Settings.domain}:#{ViteRuby.config.port}"
      mocker_api_domain = "#{Settings.domain}:3037"
      websocket_protocol = protocol == 'https' ? 'wss' : 'ws'

      script_src = [
        :self, :unsafe_eval, 'https://chatwoot.tte-work.com',
        'https://svc.webspellchecker.net', Settings.oac.base_embed_url,
        'https://cmp.osano.com', 'https://consent.trustarc.com', 'https://www.google.com',
        'https://www.gstatic.com'
      ].compact
      script_src << ENV.fetch('ASSET_HOST', nil) if ENV.fetch('ASSET_HOST', nil).present?

      style_src = [
        :self, :unsafe_inline, Settings.oac.base_embed_url, 'https://svc.webspellchecker.net'
      ].compact
      style_src << ENV.fetch('ASSET_HOST', nil) if ENV.fetch('ASSET_HOST', nil).present?
      style_src << Settings.agile_config.asset_url if Settings.agile_config.asset_url.present?

      font_src = [
        :self, :data, Settings.oac.base_embed_url, 'https://consent.trustarc.com', 'https://svc.webspellchecker.net'
      ].compact
      font_src << ENV.fetch('ASSET_HOST', nil) if ENV.fetch('ASSET_HOST', nil).present?
      font_src << Settings.agile_config.asset_url if Settings.agile_config.asset_url.present?

      connect_src = [
        :self, :blob, 'https://chatwoot.tte-work.com', 'https://*.amazonaws.com',
        'https://*.osano.com', 'https://consent-reporting.trustarc.com', 'https://consent.trustarc.com',
        'https://*.sentry.io',
        'wss://*.amazonaws.com:8443', Settings.oac.base_embed_url, Settings.secrets.s3_compatible_storage.endpoint,
        'https://www.google.com', 'https://www.gstatic.com', 'https://svc.webspellchecker.net',
        'wss://*.oci.oraclecloud.com'
      ].compact
      connect_src << Settings.agile_config.asset_url if Settings.agile_config.asset_url.present?
      connect_src << ENV.fetch('ASSET_HOST', nil) if ENV.fetch('ASSET_HOST', nil).present?
      connect_src << ENV.fetch('CLOUDFRONT_DOMAIN', nil) if ENV.fetch('CLOUDFRONT_DOMAIN', nil).present?

      object_src = [
        "https://#{Settings.secrets.s3_compatible_storage.public_bucket}.s3.#{Settings.secrets.s3_compatible_storage.region}.amazonaws.com",
        "https://#{Settings.secrets.s3_compatible_storage.private_bucket}.s3.#{Settings.secrets.s3_compatible_storage.region}.amazonaws.com",
        Settings.secrets.s3_compatible_storage.endpoint
      ].compact
      object_src << ENV.fetch('CLOUDFRONT_DOMAIN', nil) if ENV.fetch('CLOUDFRONT_DOMAIN', nil).present?

      policy.worker_src :self, :blob
      policy.default_src :self
      policy.font_src(*font_src)
      policy.img_src     '*', :data, :blob
      policy.media_src   '*', :blob
      policy.frame_src '*'
      policy.object_src(*object_src)
      policy.script_src(*script_src)
      policy.style_src(*style_src)
      policy.connect_src(*connect_src)
      policy.base_uri :self

      if Rails.env.development?
        policy.script_src(*policy.script_src,
                          :unsafe_eval, "#{protocol}://#{vite_domain}")
        policy.connect_src(
          *policy.connect_src, "#{protocol}://#{vite_domain}", "#{protocol}://*.#{vite_domain}",
          "#{websocket_protocol}://#{vite_domain}", "#{websocket_protocol}://*.#{vite_domain}",
          "#{protocol}://*.#{mocker_api_domain}", "#{protocol}://#{mocker_api_domain}"
        )
      end
    end
  end
  # rubocop:enable Metrics/BlockLength
end

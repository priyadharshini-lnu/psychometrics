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
#   # Generate session nonces for permitted importmap and inline scripts
#   config.content_security_policy_nonce_generator = ->(request) { request.session.id.to_s }
#   config.content_security_policy_nonce_directives = %w(script-src)
#
#   # Report violations without enforcing the policy.
#   # config.content_security_policy_report_only = true
# end

unless Rails.env.test?
  Rails.application.config.content_security_policy_report_only = ENV.fetch('CSP_REPORT_ONLY', 'false') == 'true'

  # rubocop:disable Metrics/BlockLength
  Rails.application.config.content_security_policy do |policy|
    protocol = Settings.protocol
    vite_domain = "#{Settings.domain}:#{ViteRuby.config.port}"
    mocker_api_domain = "#{Settings.domain}:3037"
    websocket_protocol = protocol == 'https' ? 'wss' : 'ws'

    script_src = [
      :self, :unsafe_eval, :unsafe_inline, 'https://speedof.me', 'https://chatwoot.tte-work.com',
      'https://svc.webspellchecker.net'
    ]

    script_src << ENV.fetch('ASSET_HOST', nil) if ENV.fetch('ASSET_HOST', nil).present?

    style_src = %i[
      self unsafe_inline
    ]
    style_src << ENV.fetch('ASSET_HOST', nil) if ENV.fetch('ASSET_HOST', nil).present?

    font_src = %i[
      self data
    ]
    font_src << ENV.fetch('ASSET_HOST', nil) if ENV.fetch('ASSET_HOST', nil).present?

    policy.default_src :self
    policy.font_src(*font_src)
    policy.img_src     '*', :data, :blob
    policy.media_src   '*'
    policy.object_src  '*'
    policy.frame_src   '*'
    policy.script_src(*script_src)
    policy.style_src(*style_src)
    policy.connect_src(
      :self, 'https://speedof.me', 'https://chatwoot.tte-work.com', 'https://*.amazonaws.com',
      'wss://*.amazonaws.com:8443'
    )

    if Rails.env.development?
      policy.script_src(*policy.script_src,
                        :unsafe_eval, :unsafe_inline, "#{protocol}://#{vite_domain}")
      policy.connect_src(
        *policy.connect_src, "#{protocol}://#{vite_domain}", "#{protocol}://*.#{vite_domain}",
        "#{websocket_protocol}://#{vite_domain}", "#{websocket_protocol}://*.#{vite_domain}",
        "#{protocol}://*.#{mocker_api_domain}", "#{protocol}://#{mocker_api_domain}"
      )
    end

    policy.report_uri 'https://webhook.site/f4b15a4b-6e16-401b-9bbb-716cb198157a' if Rails.env.production?
  end
  # rubocop:enable Metrics/BlockLength
end

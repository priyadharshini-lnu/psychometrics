# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# Define an application-wide content security policy
# For further information see the following documentation
# https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy

unless Rails.env.test?
  Rails.application.config.content_security_policy_report_only = ENV.fetch('CSP_REPORT_ONLY', 'false') == 'true'

  # rubocop:disable Metrics/BlockLength
  Rails.application.config.content_security_policy do |policy|
    protocol = Settings.protocol
    vite_domain = "#{Settings.domain}:#{ViteRuby.config.port}"
    websocket_protocol = protocol == 'https' ? 'wss' : 'ws'

    policy.default_src :self
    policy.font_src    :self, :data
    policy.img_src     '*', :data
    policy.media_src   '*'
    policy.object_src  '*'
    policy.frame_src   '*'
    policy.script_src(
      :self, :unsafe_inline, 'https://speedof.me', 'https://chatwoot.tte-work.com', 'https://svc.webspellchecker.net'
    )
    policy.style_src :self, :unsafe_inline
    policy.connect_src(
      :self, 'https://speedof.me', 'https://chatwoot.tte-work.com', 'https://*.amazonaws.com',
      'wss://*.amazonaws.com:8443'
    )

    if Rails.env.development?
      policy.script_src(*policy.script_src,
                        :unsafe_eval, :unsafe_inline, "#{protocol}://#{vite_domain}")
      policy.connect_src(
        *policy.connect_src, "#{protocol}://#{vite_domain}", "#{protocol}://*.#{vite_domain}",
        "#{websocket_protocol}://#{vite_domain}", "#{websocket_protocol}://*.#{vite_domain}"
      )
    end

    policy.report_uri 'https://webhook.site/f4b15a4b-6e16-401b-9bbb-716cb198157a' if Rails.env.production?
  end
  # rubocop:enable Metrics/BlockLength
end

# frozen_string_literal: true

module Interceptors
  class LogEmailInterceptor
    def self.delivering_email(mail)
      to = mail.header[:to].to_s
      subject = mail.header[:subject].to_s

      Rails.logger.info "LogEmailInterceptor: Sending to '#{to}' with subject '#{subject}'"
    end
  end
end

# frozen_string_literal: true

class SmtpSetting < ApplicationRecord
  audited except: %i[encrypted_password encrypted_password_iv]
  include ApplicationConfigurationLoggable

  belongs_to :project, class_name: 'Client'
  include Tenantable

  before_save :clear_smtp_credentials_if_needed

  attr_encrypted :password, key: Base64.decode64(Settings.secrets.encrypted_key.to_s)

  enum :encryption, { none: 0, ssl: 1, tls: 2 }, prefix: true
  enum :authentication_type, { plain: 0, login: 1, cram_md5: 2 }

  validates :concurrency_limit, :rate_limit, :rate_limit_period,
            numericality: { only_integer: true, greater_than: 0 }

  def from_name_and_email
    no_reply_email = "no-reply@#{Settings.domain}"
    return "#{I18n.t('mailer.from')} <#{no_reply_email}>" unless enabled?

    "#{from_name} <#{from_email.presence || no_reply_email}>"
  end

  def admin_sender_from
    no_reply_email = "no-reply@#{Settings.domain}"
    return "#{I18n.t('mailer.from')} <#{no_reply_email}>" unless enabled?

    "#{from_name} <#{from_email.presence || no_reply_email}>"
  end

  def settings_for_email
    return if use_sender_verification?
    return if !enabled? || host.blank? || !Settings.features.smtp_enabled

    options = {
      address: host,
      port: port,
      user_name: user_name,
      password: password,
      authentication: authentication_type
    }
    return options.merge(tls: true) if encryption_tls?
    return options.merge(ssl: true) if encryption_ssl?

    options
  end

  private

  def clear_smtp_credentials_if_needed
    return unless use_sender_verification?

    self.host = nil
    self.port = nil
    self.user_name = nil
    self.password = nil
    self.encryption = :none
    self.authentication_type = :plain
  end
end

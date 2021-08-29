# frozen_string_literal: true

class SmtpSettingMailer < ApplicationMailer
  def test_email(smtp_attributes, to_email)
    smtp_setting = SmtpSetting.new(smtp_attributes)
    mail(
      from: smtp_setting.from_name_and_email,
      to: to_email,
      subject: 'This is a test email',
      body: 'Test email content',
      content_type: 'text',
      delivery_method_options: smtp_setting.settings_for_email
    )
  end
end

# frozen_string_literal: true

module Threesixty
  class ScheduleEmailMailer < ApplicationMailer
    layout 'mailer/layouts/end_user_email_without_footer'

    def send_scheduled_email(schedule_email, context)
      @body = get_body(schedule_email, context)
      smtp_setting = context[:recipient].project.smtp_setting
      from_name = schedule_email.from || smtp_setting.from_name
      from_email = smtp_setting.enabled? && smtp_setting.from_email.presence
      from_email ||= "no-reply@#{Settings.domain}"
      send_email(
        context[:recipient],
        from: "#{from_name} <#{from_email}>",
        reply_to: schedule_email.reply_to_email,
        subject: get_subject(schedule_email, context),
        content_type: 'text/html',
        template_path: 'mailer/threesixty/schedule_email',
        delivery_method_options: smtp_setting.settings_for_email
      )
    end

    private

    def get_body(schedule_email, context)
      recipient_locale = context[:recipient].locale || I18n.default_locale
      template_in_locale_exists = schedule_email.template.present? &&
                                  schedule_email.template.content(locale: recipient_locale).present?
      locale_to_use = template_in_locale_exists ? recipient_locale : I18n.default_locale

      Mobility.with_locale(locale_to_use) do
        I18n.with_locale(locale_to_use) do
          Threesixty::PipedText::Perform.call!(schedule_email.template&.content || schedule_email.content, context)
        end
      end
    end

    def get_subject(schedule_email, context)
      Mobility.with_locale(context[:recipient].locale || I18n.default_locale) do
        schedule_email.template&.subject || schedule_email.subject
      end
    end
  end
end

# frozen_string_literal: true

module Threesixty
  class ScheduleEmailMailer < ApplicationMailer
    layout 'mailer/layouts/end_user_email_without_footer'

    def send_email(schedule_email, context)
      @body = get_body(schedule_email, context)
      smtp_setting = context[:recipient].project.smtp_setting
      from_name = schedule_email.from || smtp_setting.from_name
      from_email = smtp_setting.enabled? && smtp_setting.from_email.presence
      from_email ||= "no-reply@#{Settings.domain}"
      mail(
        from: "#{from_name} <#{from_email}>",
        to: context[:recipient].email,
        reply_to: schedule_email.reply_to_email,
        subject: get_subject(schedule_email, context),
        content_type: 'text/html',
        template_path: 'mailer/threesixty/schedule_email',
        delivery_method_options: smtp_setting.settings_for_email
      )
    end

    private

    def get_body(schedule_email, context)
      Mobility.with_locale(context[:recipient].locale || I18n.default_locale) do
        Threesixty::PipedText::Perform.call!(schedule_email.template&.content || schedule_email.content, context)
      end
    end

    def get_subject(schedule_email, context)
      Mobility.with_locale(context[:recipient].locale || I18n.default_locale) do
        schedule_email.template&.subject || schedule_email.subject
      end
    end
  end
end

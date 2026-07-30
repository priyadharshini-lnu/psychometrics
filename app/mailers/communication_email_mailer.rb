# frozen_string_literal: true

class CommunicationEmailMailer < ApplicationMailer
  layout 'mailer/layouts/end_user_email_without_footer'

  def create(email_id)
    @communication_email = CommunicationEmail.preload(:communication, :communication_email_resources).find(email_id)
    @resource = recipient

    user_locale = recipient&.locale || I18n.default_locale
    template_has_ar = @communication_email.communication.
                      body(locale: :ar, fallback: false).
                      present?
    @is_rtl = user_locale.to_s == 'ar' && template_has_ar

    I18n.with_locale(user_locale) do
      prepare_and_send_email
    end

    @communication_email.update(sent_at: Time.current)
  end

  private

  def communication
    @communication_email.communication
  end

  def project
    recipient&.project || communication&.project
  end

  def prepare_and_send_email
    attach_ical
    attach_booking_summary_excel if communication.kind == 'assessment_center_booking_summary'
    data = build_template_data
    body_content = process_body_content
    @body = Mustache.render(replace_new_piped_texts(body_content), data)
    subject = build_subject(data)

    Rails.logger.info("Email has been sent. Email=#{recipient.email}, Body=#{@body}")
    send_configured_email(subject)
  end

  def attach_booking_summary_excel
    excel_package = Communications::Export::AssessmentCenterBookingSummary.generate(communication)
    attachments['assessment_center_booking_summary.xlsx'] = {
      mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      content: excel_package.to_stream.read
    }
  end

  def build_template_data
    data = recipient.slice(:first_name, :last_name, :email)
    data[:user_link] = accept_invitation_link
    data[:user_url] = accept_invitation_url
    data[:user_link_qrcode] = accept_invitation_qrcode

    campaign_user = @communication_email.campaign_user
    if campaign_user
      time_zone = campaign_user.campaign.time_zone
      data[:schedule_start_date] = format_date(campaign_user&.schedule_start_date, time_zone)
      data[:schedule_end_date] = format_date(campaign_user&.schedule_end_date, time_zone)
    end

    data
  end

  def process_body_content
    body_content = Mobility.with_locale(I18n.locale) do
      communication.body
    end

    return body_content unless @is_rtl && body_content.present?

    apply_rtl_styling(body_content)
  end

  def apply_rtl_styling(content)
    unless content.include?('dir=')
      content = %(<div dir="rtl" style="text-align: start; direction: rtl;">#{content}</div>)
    end

    content = content.gsub(/<p(?!\s[^>]*dir=)/i,
                           '<p dir="rtl" style="text-align: start; direction: rtl;"')
    content.gsub(/<div(?!\s[^>]*dir=)/i,
                 '<div dir="rtl" style="text-align: start; direction: rtl;"')
  end

  def build_subject(data)
    subject_content = Mobility.with_locale(I18n.locale) do
      communication.subject
    end

    Mustache.render(
      replace_new_piped_texts(subject_content),
      data.slice(:first_name, :last_name)
    )
  end

  def send_configured_email(subject)
    smtp_setting = project&.smtp_setting
    cc_emails = communication.cc_users.pluck(:email)

    send_email(
      recipient,
      from: smtp_setting.from_name_and_email,
      subject: subject,
      cc: cc_emails,
      template_path: 'mailer/communication_email',
      delivery_method_options: smtp_setting.settings_for_email
    )
  end

  def attach_ical
    if workshop
      ical = Workshops::GenerateIcal.call!(workshop, recipient, type: :booking)
      attachments['event.ics'] = { mime_type: 'text/calendar', content: ical }
    end
  end

  def workshop
    @workshop ||= @communication_email.workshop
  end

  def replace_new_piped_texts(content)
    Communications::PipedText::Perform.call!(
      content,
      {
        workshop: @communication_email.workshop,
        workshop_invite: @communication_email.workshop_invite,
        user: @communication_email.user || @communication_email.campaign_user&.user,
        campaign: campaign,
        user_report: user_report
      }.compact
    )
  end

  def format_date(date, time_zone)
    return unless date

    normalized_tz = TimezoneHelper.normalize(time_zone) || Time.zone.name
    I18n.l date.in_time_zone(normalized_tz), format: :with_time_zone
  end

  def recipient
    @communication_email.user || @communication_email.campaign_user&.user
  end

  def accept_invitation_link
    "<a href=\"#{accept_invitation_url}\"> #{I18n.t('devise.mailer.invitation_instructions.accept')} </a>"
  end

  def accept_invitation_url
    @accept_invitation_url ||=
      if recipient.invitation_accepted?
        options = { domain: Settings.domain, subdomain: project.subdomain }
        url_for([:root, options])
      else
        token = create_raw_invitation_token
        options = { id: @recipient_id, invitation_token: token, domain: Settings.domain,
                    subdomain: project.subdomain }
        url_for([:accept, recipient.role_scope, :invitation, options])
      end
  end

  def accept_invitation_qrcode
    return unless communication.body&.include?('{{{user_link_qrcode}}}')

    png_file = RQRCode::QRCode.new(accept_invitation_url).as_png(:size => 600)
    attachments.inline['activation-qrcode.png'] = png_file.to_blob
    "<img src=\"#{attachments['activation-qrcode.png'].url}\" width=\"300\" height=\"300\"></img>"
  end

  def create_raw_invitation_token
    if recipient.encrypted_invitation_raw.nil?
      recipient.skip_invitation = true
      recipient.send(:generate_invitation_token!)
      recipient.update_column(:invitation_sent_at, DateTime.current)
    end
    Rails.application.
      message_verifier(Settings.secrets.secret_token_for_generate).
      verify(recipient.encrypted_invitation_raw)
  end

  def campaign
    @communication_email.project_campaign
  end

  def user_report
    @communication_email.communication_email_resources.find { |r| r.resource_type == 'UserReport' }&.resource
  end
end

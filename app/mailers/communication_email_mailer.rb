# frozen_string_literal: true

class CommunicationEmailMailer < ApplicationMailer
  layout 'mailer/layouts/end_user_email_without_footer'

  def create(email_id)
    @communication_email = CommunicationEmail.
                           preload(:communication, :communication_delivery, :communication_email_resources).
                           find(email_id)
    @communication_email.increment!(:attempts)
    @resource = recipient

    user_locale = recipient&.locale || I18n.default_locale

    I18n.with_locale(user_locale) do
      prepare_and_send_email(user_locale)
    end

    @communication_email.update!(sent_at: Time.current, status: :sent)
  rescue StandardError => e
    @communication_email.update!(status: :failed, error_code: e.class.name, error_message: e.message)
    raise
  end

  private

  def content_source
    @communication_email.content_source
  end

  def communication
    @communication_email.communication
  end

  def project
    recipient&.project || communication&.project
  end

  def prepare_and_send_email(user_locale)
    attach_ical
    attach_booking_summary_excel if content_source.kind == 'assessment_center_booking_summary'

    rendered = Communications::Emails::RenderContent.call!(
      @communication_email, locale: user_locale, data: template_data
    )
    @body = rendered.body

    Rails.logger.info("Email has been sent. Email=#{recipient.email}, Body=#{@body}")
    send_configured_email(rendered.subject)
  end

  def attach_booking_summary_excel
    excel_package = Communications::Export::AssessmentCenterBookingSummary.generate(communication)
    attachments['assessment_center_booking_summary.xlsx'] = {
      mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      content: excel_package.to_stream.read
    }
  end

  def template_data
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

  def send_configured_email(subject)
    smtp_setting = project&.smtp_setting
    cc_emails = content_source.cc_emails

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
    return unless content_source.body&.include?('{{{user_link_qrcode}}}')

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
    KeyRotation::InvitationTokenVerifier.verify(recipient.encrypted_invitation_raw)
  end
end

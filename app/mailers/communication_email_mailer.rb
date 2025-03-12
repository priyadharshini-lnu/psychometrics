# frozen_string_literal: true

class CommunicationEmailMailer < ApplicationMailer
  layout 'mailer/layouts/end_user_email_without_footer'

  def create(email_id)
    @communication_email = CommunicationEmail.preload(:communication, :communication_email_resources).find(email_id)
    @resource = recipient
    attach_ical
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

    @body = Mustache.render(replace_new_piped_texts, data)
    subject = Mustache.render(@communication_email.communication.subject, data.slice(:first_name, :last_name))

    Rails.logger.info("Email has been sent. Email=#{recipient.email}, Body=#{@body}")
    smtp_setting = recipient.project.smtp_setting
    send_email(
      recipient,
      from: smtp_setting.from_name_and_email,
      subject: subject,
      template_path: 'mailer/communication_email',
      delivery_method_options: smtp_setting.settings_for_email
    )
    @communication_email.update(sent_at: Time.current)
  end

  private

  def attach_ical
    if workshop
      ical = Workshops::GenerateIcal.call!(workshop, recipient, type: :booking)
      attachments['event.ics'] = { mime_type: 'text/calendar', content: ical }
    end
  end

  def workshop
    @workshop ||= @communication_email.workshop
  end

  def replace_new_piped_texts
    Communications::PipedText::Perform.call!(
      @communication_email.communication.body,
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

    I18n.l date.in_time_zone(time_zone || Time.zone.name), format: :with_time_zone
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
        options = { domain: Settings.domain, subdomain: recipient.project.subdomain }
        url_for([:root, options])
      else
        token = create_raw_invitation_token
        options = { id: @recipient_id, invitation_token: token, domain: Settings.domain,
                    subdomain: recipient.project.subdomain }
        url_for([:accept, recipient.role_scope, :invitation, options])
      end
  end

  def accept_invitation_qrcode
    return unless @communication_email.communication.body.include?('{{{user_link_qrcode}}}')

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

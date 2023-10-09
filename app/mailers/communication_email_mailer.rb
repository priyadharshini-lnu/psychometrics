# frozen_string_literal: true

class CommunicationEmailMailer < ApplicationMailer
  layout 'mailer/layouts/end_user_email_without_footer'

  def create(email_id)
    @communication_email = CommunicationEmail.preload(:communication).find(email_id)
    @resource = recipient
    data = recipient.slice(:first_name, :last_name, :email)
    data[:user_link] = accept_invitation_link
    data[:user_url] = accept_invitation_url
    data[:user_link_qrcode] = accept_invitation_qrcode
    campaign_user = @communication_email.campaign_user
    data[:schedule_start_date] = format_date(campaign_user&.schedule_start_date)
    data[:schedule_end_date] = format_date(campaign_user&.schedule_end_date)
    @body = Mustache.render(replace_new_piped_texts, data)
    Rails.logger.info("Email has been sent. Email=#{recipient.email}, Body=#{@body}")
    smtp_setting = recipient.project.smtp_setting
    mail(
      from: smtp_setting.from_name_and_email,
      to: recipient.email,
      subject: @communication_email.communication.subject,
      template_path: 'mailer/communication_email',
      delivery_method_options: smtp_setting.settings_for_email
    )
    @communication_email.update(sent_at: Time.current)
  end

  private

  def replace_new_piped_texts
    Communications::PipedText::Perform.call!(
      @communication_email.communication.body,
      { workshop: @communication_email.workshop, workshop_invite: @communication_email.workshop_invite }.compact
    )
  end

  def format_date(date)
    return unless date

    I18n.l  date, format: :with_time_zone
  end

  def entity
    @entity ||= if @communication_email.membership_id
                  Membership.join_user.find(@communication_email.membership_id)
                else
                  @communication_email.campaign_user
                end
  end

  def recipient
    entity.user
  end

  def accept_invitation_link
    "<a href=\"#{accept_invitation_url}\"> #{I18n.t('devise.mailer.invitation_instructions.accept')} </a>"
  end

  def accept_invitation_url
    @accept_invitation_url ||=
      if recipient.invitation_accepted?
        options = { domain: Settings.domain, subdomain: entity.project.subdomain }
        url_for([:root, options])
      else
        token = create_raw_invitation_token
        options = { id: @recipient_id, invitation_token: token, domain: Settings.domain,
                    subdomain: entity.project.subdomain }
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
      message_verifier(Rails.application.secrets.secret_token_for_generate).
      verify(recipient.encrypted_invitation_raw)
  end
end

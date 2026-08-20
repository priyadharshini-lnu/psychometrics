# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: "#{Branding.display_name} <no-reply@#{Settings.domain}>"
  layout 'mailer'
  helper :mailer
  self.delivery_job = ProjectMailDeliveryJob

  def send_email(user, details, &)
    unless user.can_receives_communication?
      Rails.logger.info "Unable to send email to disabled user with id '#{user.id}' and email #{user.email}."
      return
    end

    details = details.merge(to: user.email) if user && details[:to].blank?
    email = mail(details, &) # rubocop:disable CustomRubocops/AvoidDirectUseOfMailMethod
    if details[:delivery_method_options].present?
      email.delivery_method.settings = email.delivery_method.settings.merge(details[:delivery_method_options])
    end
    email
  end

  protected

  def admin_sender_attributes(client)
    smtp_setting = client&.smtp_setting
    return {} unless smtp_setting

    attributes = {
      from: smtp_setting.admin_sender_from
    }

    delivery_options = smtp_setting.settings_for_email
    attributes[:delivery_method_options] = delivery_options if delivery_options.present?

    attributes
  end

  def default_url_options
    super.merge(admin_url_host_options)
  end

  private

  def admin_url_host_options
    AdminSubdomain.host_options_for(user: @user, project: @project)
  end
end

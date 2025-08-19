# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: "#{I18n.t('mailer.from')} <no-reply@#{Settings.domain}>"
  layout 'mailer'
  helper :mailer
  self.delivery_job = ProjectMailDeliveryJob

  def send_email(user, details, &)
    unless user.can_receives_communication?
      Rails.logger.info "Unable to send email to disabled user with id '#{user.id}' and email #{user.email}."
      return
    end

    details = details.merge(to: user.email) if user && details[:to].blank?
    mail(details, &) # rubocop:disable CustomRubocops/AvoidDirectUseOfMailMethod
  end
end

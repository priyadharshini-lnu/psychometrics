# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: "#{I18n.t('mailer.from')} <no-reply@#{Settings.domain}>"
  layout 'mailer'
end

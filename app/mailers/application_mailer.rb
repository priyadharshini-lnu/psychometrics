class ApplicationMailer < ActionMailer::Base
  default from: "#{Settings.project_name} <no-reply@#{Settings.domain}>"
  layout 'mailer'
end

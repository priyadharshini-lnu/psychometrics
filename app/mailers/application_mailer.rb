class ApplicationMailer < ActionMailer::Base
  default from: "#{Settings.project_name} <no-reply@psychometrics.com>"
  layout 'mailer'
end

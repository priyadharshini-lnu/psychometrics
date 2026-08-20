# frozen_string_literal: true

class DeploymentMailer < ApplicationMailer
  layout 'admin_email'

  # rubocop:disable Rails/I18nLocaleTexts
  def send_deployment_tasks(emails, tasks)
    @tasks = tasks
    # rubocop:disable CustomRubocops/AvoidDirectUseOfMailMethod
    mail(
      from: "#{Branding.display_name} <no-reply@#{Settings.domain}>",
      to: emails,
      subject: 'Deployment tasks to complete',
      template_path: 'mailer/platform',
      template_name: 'send_deployment_tasks'
    )
    # rubocop:enable CustomRubocops/AvoidDirectUseOfMailMethod
  end
  # rubocop:enable all
end

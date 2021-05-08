# frozen_string_literal: true

class DeploymentTask
  @records = []

  def self.add(task_details)
    @records.push(task_details)
    puts("\n", '=' * 120)
    puts task_details
    puts('=' * 120, "\n")
  end

  def self.send_deployment_tasks_email
    emails = ENV['EMAILS_FOR_DEPLOYMENT_TASK']&.split(',')&.map(&:strip)
    DeploymentMailer.send_deployment_tasks(emails, @records).deliver_later if emails.present?
  end
end

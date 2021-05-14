# frozen_string_literal: true

Rake::Task['db:migrate'].enhance do
  DeploymentTask.send_deployment_tasks_email
end

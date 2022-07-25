# frozen_string_literal: true
# TODO: remove after rails upgrade??
require_relative '../deployment_task'

Rake::Task['db:migrate'].enhance do
  DeploymentTask.send_deployment_tasks_email
end

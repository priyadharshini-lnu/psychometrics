# frozen_string_literal: true

class DeploymentTaskToAddPlatformAdminsEnvVariable < ActiveRecord::Migration[7.1]
  def change
    DeploymentTask.add( # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      'Add PLATFORM_ADMINS env variable to send emails to platform admins on platform exceptions threshold exceeding'
    )
  end
end

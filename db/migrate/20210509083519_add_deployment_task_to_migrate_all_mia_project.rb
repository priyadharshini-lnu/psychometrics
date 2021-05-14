# frozen_string_literal: true

class AddDeploymentTaskToMigrateAllMiaProject < ActiveRecord::Migration[5.2]
  def change
    DeploymentTask.add('Migrate all projects of Mai client and remove CLIENT_IDS_TO_EXCLUDE_FOR_PROJECT_MIGRATION env')
  end
end

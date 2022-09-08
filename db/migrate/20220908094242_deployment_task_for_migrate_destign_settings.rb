# frozen_string_literal: true

class DeploymentTaskForMigrateDestignSettings < ActiveRecord::Migration[6.1]
  def change
    DeploymentTask.add('Migrate all project design settings `rake one_time:migrate_client_design_settings`')
  end
end

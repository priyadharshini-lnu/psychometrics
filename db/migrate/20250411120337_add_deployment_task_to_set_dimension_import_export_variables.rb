# frozen_string_literal: true

class AddDeploymentTaskToSetDimensionImportExportVariables < ActiveRecord::Migration[7.1]
  def change
    DeploymentTask.add( # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      'Add IMPORT_EXPORT_SECRET env variable for the project lighthouse project.'
    )
  end
end

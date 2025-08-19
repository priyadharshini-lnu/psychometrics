# frozen_string_literal: true

class AddDailycoStorageConfigOnServer < ActiveRecord::Migration[7.1]
  def change
    DeploymentTask.add( # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      'Add S3_COMPATIBLE_STORAGE_DAILYCO_BUCKET, and DAILY_CO_ASSUME_ROLE_ARN env variables'
    )
  end
end

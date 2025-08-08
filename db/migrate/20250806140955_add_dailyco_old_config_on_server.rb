# frozen_string_literal: true

class AddDailycoOldConfigOnServer < ActiveRecord::Migration[7.1]
  def change
    DeploymentTask.add( # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      'Add DAILY_CO_BUCKET_STORAGE_SERVICE_KEY, DAILY_CO_OLD_API_KEY, DAILY_CO_OLD_SUBDOMAIN,
      DAILY_CO_OLD_DOMAIN_ID env variables'
    )
  end
end

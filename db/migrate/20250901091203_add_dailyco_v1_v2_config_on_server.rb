# frozen_string_literal: true

class AddDailycoV1V2ConfigOnServer < ActiveRecord::Migration[7.1]
  def change
    DeploymentTask.add( # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      'Add DAILY_CO_V1_API_KEY, DAILY_CO_V1_SUBDOMAIN, DAILY_CO_V1_DOMAIN_ID,
      DAILY_CO_V2_API_KEY, DAILY_CO_V2_SUBDOMAIN, DAILY_CO_V2_DOMAIN_ID env variables'
    )
  end
end

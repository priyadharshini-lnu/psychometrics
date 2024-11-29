# frozen_string_literal: true

class AddDeviseCredentailsToEnv < ActiveRecord::Migration[7.1]
  def change
    DeploymentTask.add( # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      'Add DEVISE_SECRET_KEY env variable'
    )
  end
end

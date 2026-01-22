# frozen_string_literal: true

class AddDeloymentTaskForMhs < ActiveRecord::Migration[8.0]
  def change
    DeploymentTask.add( # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      'Add MHS_API_BASE_URL MHS_API_KEY env variables'
    )
  end
end

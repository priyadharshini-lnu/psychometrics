# frozen_string_literal: true

class AddSimulationCredentials < ActiveRecord::Migration[7.1]
  def change
    DeploymentTask.add( # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      'Add SIMULATION_API_KEY, SIMULATION_BASE_API_URL, SIMULATION_FRONTEND_BASE_URL and SIMULATION_SHARED_SECRET env variables' # rubocop:disable Layout/LineLength
    )
  end
end

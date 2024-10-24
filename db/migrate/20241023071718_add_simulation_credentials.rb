class AddSimulationCredentials < ActiveRecord::Migration[7.1]
  def change
    DeploymentTask.add('Add SIMULATION_API_KEY, SIMULATION_BASE_API_URL, SIMULATION_FRONTEND_BASE_URL and SIMULATION_SHARED_SECRET env variables')
  end
end

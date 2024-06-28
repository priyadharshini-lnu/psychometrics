class AddHoganMercerCredentials < ActiveRecord::Migration[7.1]
  def change
    DeploymentTask.add('Add HOGAN_DEFAULT_PROVIDER, HOGAN_MERCER_CLIENT_ID, HOGAN_MERCER_CLIENT_PASSWORD, HOGAN_MERCER_CLIENT_USER_ID and HOGAN_MERCER_MASTER_CLIENT_ID env variables')
  end
end

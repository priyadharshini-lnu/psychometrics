class AddTwilioVerifyServiceIdOnServer < ActiveRecord::Migration[7.1]
  def change
    DeploymentTask.add('Add TWILIO_VERIFY_SERVICE_ID env variables')
  end
end

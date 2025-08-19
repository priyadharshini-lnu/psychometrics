# frozen_string_literal: true

class AddDeploymentTaskToSetRecaptchaMinScoreEnvVariable < ActiveRecord::Migration[7.1]
  def change
    DeploymentTask.add( # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      'Add RECAPTCHA_MINIMUM_SCORE env variable for the google recaptcha v3.'
    )
  end
end

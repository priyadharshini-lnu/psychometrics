# frozen_string_literal: true

class AddDeploymentTaskToSetRecaptchaRelatedVariables < ActiveRecord::Migration[7.1]
  def change
    DeploymentTask.add( # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      'Add RECAPTCHA_SITE_KEY, RECAPTCHA_SECRET_KEY, DISABLE_RECAPTCHA env
      variables for the google recaptcha v3.'
    )
  end
end

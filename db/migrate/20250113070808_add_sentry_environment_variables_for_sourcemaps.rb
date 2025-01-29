# frozen_string_literal: true

class AddSentryEnvironmentVariablesForSourcemaps < ActiveRecord::Migration[7.1]
  def change
    DeploymentTask.add( # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      'Add SENTRY_ORG, SENTRY_PROJECT and SENTRY_AUTH_TOKEN env variables for the project lighthouse project.'
    )
  end
end

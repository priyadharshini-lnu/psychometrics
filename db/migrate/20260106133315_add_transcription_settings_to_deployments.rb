# frozen_string_literal: true

class AddTranscriptionSettingsToDeployments < ActiveRecord::Migration[8.0]
  def change
    DeploymentTask.add( # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      'Add TRANSCRIPTION_PROVIDER, TRANSCRIPTION_MODEL, OCI_NAMESPACE,
      MEDIA_TO_TRANSCRIPTION_LAMBDA_URL, MEDIA_TO_TRANSCRIPTION_FAAS_ENABLED,
      MEDIA_TO_TRANSCRIPTION_SQS_URL env variables'
    )
  end
end

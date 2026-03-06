# frozen_string_literal: true

class AddDeploymentTaskForBulkAssetsUploadFeature < ActiveRecord::Migration[8.0]
  def change
    DeploymentTask.add( # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      'Add EXTRACT_AND_UPLOAD_SQS_URL and UPLOAD_BULK_ASSETS_ENABLED env variables
      and set UPLOAD_BULK_ASSETS_ENABLED to true for .ae and .com'
    )
  end
end

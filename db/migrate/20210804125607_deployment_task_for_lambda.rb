# frozen_string_literal: true

class DeploymentTaskForLambda < ActiveRecord::Migration[5.2]
  def change
    DeploymentTask.add(
      'Add ZIP_S3_FILES_LAMBDA_ENABLED to true and ZIP_S3_FILES_SQS_URL for bulk download to use lambda'
    )
    DeploymentTask.add('Change SQS_URL env name to URL_TO_PDF_SQS_URL')
  end
end

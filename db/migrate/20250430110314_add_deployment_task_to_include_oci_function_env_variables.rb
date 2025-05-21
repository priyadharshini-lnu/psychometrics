# frozen_string_literal: true

class AddDeploymentTaskToIncludeOciFunctionEnvVariables < ActiveRecord::Migration[7.1]
  def change
    # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
    deployment_task_message = <<~MESSAGE
      Set the following environment variables
      - FAAS_SIGNING_SECRET (renamed from LAMBDA_SIGNING_SECRET)
      - URL_TO_PDF_FAAS_ENABLED (renamed from URL_TO_PDF_LAMBDA_ENABLED)
      - ZIP_S3_FILES_FAAS_ENABLED (renamed from ZIP_S3_FILES_LAMBDA_ENABLED)

      Also include the following environment variables for OCI function integration if OCI functions needs to be used:
      - OCI_PRIVATE_KEY
      - OCI_USER_ID
      - OCI_TENANCY
      - OCI_FINGERPRINT
      - CLOUD_FUNCTION_SERVICE
      - OCI_URL_TO_PDF_INVOKE_ENDPOINT
      - OCI_ZIP_S3_FILES_INVOKE_ENDPOINT

      Note:
      - CLOUD_FUNCTION_SERVICE should be set to either `oci` or `aws`. By default, it is `aws`.
    MESSAGE
    DeploymentTask.add(deployment_task_message)
    # rubocop:enable CustomRubocops/AvoidActiveRecordInMigrations
  end
end

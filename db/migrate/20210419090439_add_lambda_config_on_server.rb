# frozen_string_literal: true

class AddLambdaConfigOnServer < ActiveRecord::Migration[5.2]
  def change
    DeploymentTask.add('Add URL_TO_PDF_LAMBDA_URL, URL_TO_PDF_SSN_ARN and SIGNING_SECRET env variables')
  end
end

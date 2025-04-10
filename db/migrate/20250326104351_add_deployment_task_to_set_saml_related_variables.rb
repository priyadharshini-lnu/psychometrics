# frozen_string_literal: true

class AddDeploymentTaskToSetSamlRelatedVariables < ActiveRecord::Migration[7.1]
  def change
    DeploymentTask.add( # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      'Add DISABLE_SAML_FOR_ADMINS, SAML_ASSERTION_CONSUMER_SERVICE_URL, SAML_ISSUER, SAML_IDP_ENTITY_ID, SAML_IDP_SSO_SERVICE_URL and SAML_IDP_CERT env variables for the project lighthouse project.' # rubocop:disable Layout/LineLength
    )
  end
end

# frozen_string_literal: true

class Integration < ApplicationRecord
  audited
  include ApplicationConfigurationLoggable

  belongs_to :project, class_name: 'Client'
  include Tenantable

  enum :name, { iiht: 0, hogan: 1, mettl: 2, skillvue: 3, yoodli: 4, microsite: 5 }

  scope :active, -> { where(active: true) }
  scope :lti_tools, -> { where(name: :yoodli) }

  after_commit :trigger_fetch_mettl_assessments_job, if: :mettl?
  after_commit :subscribe_to_skillvue_webhook, if: :skillvue?
  after_commit :trigger_fetch_skillvue_assessments_job, if: :skillvue?
  after_commit :trigger_fetch_microsite_assessments_job, if: :microsite?

  def iiht_config
    decrypted_password = Encryptor.decrypt(Base64.decode64(config['password']))
    config.merge('password' => decrypted_password)
  end

  def mettl_config
    return {} unless mettl?

    decrypted_public_key = Encryptor.decrypt(Base64.decode64(config['public_key']))
    decrypted_private_key = Encryptor.decrypt(Base64.decode64(config['private_key']))

    config.merge('public_key' => decrypted_public_key, 'private_key' => decrypted_private_key)
  end

  def skillvue_config
    return {} unless skillvue?

    decrypted_api_key = Encryptor.decrypt(Base64.decode64(config['api_key']))
    config.merge('api_key' => decrypted_api_key)
  end

  def microsite_config
    return {} unless microsite?

    decrypted_api_key = Encryptor.decrypt(Base64.decode64(config['api_key']))
    config.merge('api_key' => decrypted_api_key)
  end

  def lti_config
    return {} unless yoodli?

    # Return the stored configuration for Yoodli LTI 1.3 integration
    # Expected config keys:
    # - launch_url: The LTI launch endpoint
    # - login_url: The OIDC login initiation endpoint
    # - keyset_url: The JWKS endpoint for tool's public keys
    config || {}
  end

  def log_attribute_for_delete
    slice(:id, :name, :project_id)
  end

  private

  def trigger_fetch_mettl_assessments_job
    Mettl::FetchAssessmentsJob.perform_later
  end

  def trigger_fetch_skillvue_assessments_job
    Skillvue::FetchAssessmentsJob.perform_later(project_id)
  end

  def trigger_fetch_microsite_assessments_job
    Microsite::FetchAssessmentsJob.perform_later(project_id)
  end

  def subscribe_to_skillvue_webhook
    Skillvue::SubscribeToWebhookJob.perform_later(project_id)
  end
end

# frozen_string_literal: true

class Integration < ApplicationRecord
  audited

  belongs_to :project, class_name: 'Client'

  enum :name, { iiht: 0, hogan: 1, mettl: 2 }

  scope :active, -> { where(active: true) }

  after_commit :trigger_fetch_assessments_job, if: :mettl?

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

  def log_attribute_for_delete
    slice(:id, :name, :project_id)
  end

  private

  def trigger_fetch_assessments_job
    Mettl::FetchAssessmentsJob.perform_later
  end
end

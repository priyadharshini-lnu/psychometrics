# frozen_string_literal: true

class Integration < ApplicationRecord
  audited

  belongs_to :project, class_name: 'Client'

  enum name: { iiht: 0, hogan: 1 }

  scope :active, -> { where(active: true) }

  def iiht_config
    decrypted_password = Encryptor.decrypt(Base64.decode64(config['password']))
    config.merge('password' => decrypted_password)
  end

  def log_attribute_for_delete
    slice(:id, :name, :project_id)
  end
end

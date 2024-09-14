# frozen_string_literal: true

class MindmillCredential < ApplicationRecord
  belongs_to :users_result

  attr_encrypted :password, key: Base64.decode64(Settings.secrets.encrypted_key.to_s)
end

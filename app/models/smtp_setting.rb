# frozen_string_literal: true

class SmtpSetting < ApplicationRecord
  belongs_to :project, class_name: 'Client'
  
  attr_encrypted :password, key: Base64.decode64(Rails.application.secrets.encrypted_key.to_s)
end

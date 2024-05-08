# frozen_string_literal: true

Encryptor.default_options.merge!(
  algorithm: 'aes-256-cbc',
  key: Base64.decode64(Settings.secrets.encrypted_key.to_s),
  iv: 'r1b9Fgd6Qo7GNQ8E'
)

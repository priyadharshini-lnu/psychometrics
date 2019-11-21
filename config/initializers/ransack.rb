# frozen_string_literal: true

Ransack.configure do |config|
  # Ransack sanitizes many values in the custom scopes into booleans.
  # 1, '1', 't', 'T', 'true', 'TRUE' all evaluate to true.
  # 0, '0', 'f', 'F', 'false', 'FALSE' all evaluate to false.
  # This default is globally overridden here.
  config.sanitize_custom_scope_booleans = false
end

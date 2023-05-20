# frozen_string_literal: true

Warden::Manager.after_authentication do |record, warden, options|
  next unless record&.enforce_password_policy_at_sign_in?

  password = warden.params.dig(:user, :password)
  next unless password

  user = record.dup
  user.password = password
  next if user.valid? || user.errors[:password].blank?

  warden.session(options[:scope])['enforce_password_change'] = true
end

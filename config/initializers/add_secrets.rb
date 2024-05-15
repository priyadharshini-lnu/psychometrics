# frozen_string_literal: true

Settings.reload_from_files(
  Rails.root.join('config/settings.yml').to_s,
  Rails.root.join('config', 'settings', "#{Rails.env}.yml").to_s,
  Rails.root.join('config/secrets/settings_secrets.yml').to_s,
  Rails.root.join('config', 'secrets', "#{Rails.env}.yml").to_s,
  Rails.root.join('config/reports/default_styles.yml').to_s
)

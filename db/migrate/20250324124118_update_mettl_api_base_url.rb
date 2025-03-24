# frozen_string_literal: true

class UpdateMettlApiBaseUrl < ActiveRecord::Migration[7.1]
  # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
  def up
    mettl_integrations = Integration.mettl
    mettl_integrations.each do |integration|
      config = integration.config
      config['api_base_url'] = ENV.fetch('METTL_BASE_API_URL', nil)
      integration.update!(config: config)
    end
  end
  # rubocop:enable CustomRubocops/AvoidActiveRecordInMigrations
end

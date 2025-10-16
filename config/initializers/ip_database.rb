# frozen_string_literal: true

require 'maxminddb'

DB_PATH = Rails.root.join('db/maxmind/GeoLite2-Country.mmdb')

begin
  Rails.application.config.ip_database = MaxMindDB.new(DB_PATH)
rescue StandardError => e
  Rails.logger.debug do
    %(
    GeoLite2-Country.mmdb is not present or failed to load.
    Error: #{e.message}
  )
  end
  Rails.application.config.ip_database = nil
end

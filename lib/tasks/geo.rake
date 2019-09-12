# frozen_string_literal: true

namespace :geo do
  desc 'Import data source'
  task import: :environment do
    ::Datas::Geo.transaction do
      ::Datas::Geo.delete_all
      source_path = Rails.root.join('public', 'source', 'GeoLite2-City-Locations-en_test.csv') if Rails.env == 'test'
      source_path ||= Rails.root.join('public', 'source', 'GeoLite2-City-Locations-en.csv')
      source = Roo::CSV.new(source_path)
      datas = source.parse(
        country_code: /country_iso_code/,
        country_name: /country_name/,
        region_code: /subdivision_1_iso_code/,
        region_name: /subdivision_1_name/,
        city: /city_name/
      )
      datas[1..-1].each do |data|
        ::Datas::Geo.create(data)
      end
    end
  end
end

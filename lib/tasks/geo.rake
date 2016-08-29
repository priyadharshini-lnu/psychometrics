namespace :geo do
  desc 'Import data source'
  task :import => :environment do
    source_path = Rails.root.join('public', 'source', 'GeoLite2-City-Locations-en.csv')
    source = Roo::CSV.new(source_path)
    datas = source.parse({
      country_code: /country_iso_code/,
      country_name: /country_name/,
      region_code: /subdivision_1_iso_code/,
      region_name: /subdivision_1_name/,
      city: /city_name/
    })
    datas[1..-1].each do |data|
      Data::Geo.create(data)
    end
  end
end

class Data::Geo < ApplicationRecord
  FIELDS = %w(city country_name country_code region_name).freeze

  self.table_name_prefix = 'data_'
  def value(column)
    return unless FIELDS.include?(column)
    send(column)
  end
end

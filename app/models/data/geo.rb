# == Schema Information
#
# Table name: data_geos
#
#  id           :integer          not null, primary key
#  country_code :string
#  country_name :string
#  region_code  :string
#  region_name  :string
#  city         :string
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

class Data::Geo < ApplicationRecord
  FIELDS = %w(city country_name country_code region_name).freeze

  self.table_name_prefix = 'data_'
  def value(column)
    return unless FIELDS.include?(column)
    send(column)
  end
end

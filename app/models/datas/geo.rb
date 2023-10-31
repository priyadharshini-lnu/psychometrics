# frozen_string_literal: true

class Datas::Geo < ApplicationRecord
  self.table_name_prefix = 'data_'

  FIELDS = %w[city country_name country_code region_name].freeze

  def value(column)
    return unless FIELDS.include?(column)

    send(column)
  end
end

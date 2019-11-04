# frozen_string_literal: true

module RansackSearchableIdField
  extend ActiveSupport::Concern

  class_methods do
    def ransack_searchable_id_field
      ransacker :id do
        Arel.sql("to_char(id, '9999999')")
      end
    end
  end
end

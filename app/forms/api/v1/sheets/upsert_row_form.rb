# frozen_string_literal: true

module Api
  module V1
    module Sheets
      class UpsertRowForm < Rectify::Form
        attribute :data, Hash, default: {}

        validate :validate_column_exists
        validate :validate_data_type

        def validate_column_exists
          data.each_key do |column_name|
            unless sheet_columns[column_name]
              errors.add(:data, I18n.t('datasheet.errors.datasheet_column.not_found', column_name: column_name))
            end
          end
        end

        def validate_data_type
          data.each do |field, value|
            column = sheet_columns[field]

            next unless column

            next if value.nil?

            if column.column_type == 'number' && !value.is_a?(Numeric)
              errors.add(
                :data,
                I18n.t('datasheet.errors.datasheet_column.numeric_value_required', field: field)
              )
            elsif !value.is_a?(String)
              errors.add(
                :data,
                I18n.t('datasheet.errors.datasheet_column.string_value_required', field: field)
              )
            end
          end
        end

        private

        def sheet_columns
          sheet.sheet_columns.index_by(&:name)
        end

        def sheet
          context[:sheet]
        end
      end
    end
  end
end

# frozen_string_literal: true

module Campaigns
  module Users
    class ParseImportData < BaseCommand
      private_attr_reader :import_data

      HEADER_IMPORT_KEYS = %i[active first_name last_name email password created_at].freeze

      def initialize(import_data)
        @import_data = import_data
      end

      def call
        rows = Roo::CSV.new(import_data.path).to_a
        header = rows.shift
        rows = rows.map do |row|
          row.each_with_object({}).with_index do |(value, attrs), index|
            key = HEADER_IMPORT_KEYS[index]
            attrs[key] = key == :active ? value.presence && value == 'Yes' : value
          end
        end
        broadcast :ok, [header] + rows
      end
    end
  end
end

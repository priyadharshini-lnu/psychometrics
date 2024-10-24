# frozen_string_literal: true

module Sheets
  class GetColumns < BaseCommand
    private_attr_reader :datasheet, :opts

    def initialize(datasheet, opts = {})
      @datasheet = datasheet
      @opts = opts
      @by_access = Array.wrap(opts[:by_access] || [])
    end

    def call
      columns = datasheet.sheet_columns.select do |column|
        next column.accessor_access if access_include?(:assessor)
        next column.dashboard_use if access_include?(:dashboard)

        true
      end
      broadcast :ok, columns
    end

    def access_include?(attribute)
      @by_access.include?(attribute)
    end
  end
end

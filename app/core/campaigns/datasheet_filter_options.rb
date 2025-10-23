# frozen_string_literal: true

module Campaigns
  class DatasheetFilterOptions < BaseCommand
    attr_reader :campaign

    def initialize(campaign)
      @campaign = campaign
    end

    def call
      datasheet_filter_options = Hash.new { |h, k| h[k] = [] }
      return unless campaign.project_datasheet

      datasheet_rows = campaign.project_datasheet.rows.map do |r|
        SheetRows::GetData.call!(r).except(:id, 'Email', 'email')
      end

      datasheet_rows.each do |row_data|
        row_data.each do |key, value|
          datasheet_filter_options[key.to_s] << value
        end
      end

      broadcast(:ok, { options: datasheet_filter_options.transform_values!(&:uniq) })
    end
  end
end

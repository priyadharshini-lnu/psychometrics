# frozen_string_literal: true

module Campaigns
  class GetDatasheetData < BaseCommand
    private_attr_reader :campaign, :emails

    def initialize(campaign, emails)
      @campaign = campaign
      @emails = Array.wrap(emails)
    end

    def call
      result = emails.each_with_object({}) do |email, acc|
        project_datasheet_data = project_datasheet_rows_data[email] || {}
        campaign_datasheet_data = campaign_datasheet_rows_data[email] || {}

        acc[email] = project_datasheet_data.merge(campaign_datasheet_data)
      end

      broadcast :ok, result
    end

    private

    def campaign_datasheet_rows_data
      return {} unless campaign.datasheet

      rows = campaign.datasheet.rows.where(email: emails).includes(sheet_row_data: :sheet_column)
      @campaign_datasheet_rows_data ||= row_data(rows)
    end

    def project_datasheet_rows_data
      return {} unless campaign.project.datasheet

      rows = campaign.project.datasheet.rows.where(email: emails).includes(sheet_row_data: :sheet_column)
      @project_datasheet_rows_data ||= row_data(rows)
    end

    def row_data(rows)
      rows.each_with_object({}) do |row, acc|
        acc[row.email] = row.sheet_row_data.each_with_object({}) do |datum, data|
          data[datum.sheet_column.name] = datum.value
          data
        end
        acc
      end
    end
  end
end

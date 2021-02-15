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
        project_datasheet_data = project_datasheet_rows[email]&.data || {}
        campaign_datasheet_data = campaign_datasheet_rows[email]&.data || {}

        acc[email] = project_datasheet_data.merge(campaign_datasheet_data)
      end

      broadcast :ok, result
    end

    private

    def campaign_datasheet_rows
      @campaign_datasheet_rows ||= campaign.datasheet&.
        rows&.where(email: emails)&.index_by(&:email) || {}
    end

    def project_datasheet_rows
      @project_datasheet_rows ||= campaign.project.datasheet&.
        rows&.where(email: emails)&.index_by(&:email) || {}
    end
  end
end

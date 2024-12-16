# frozen_string_literal: true

require 'csv'

module Campaigns
  module ExternalCampaignScoresImport
    class ProcessRows < BaseCommand
      private_attr_reader :rows, :campaign

      def initialize(rows, campaign)
        @rows = rows
        @campaign = campaign
      end

      # Process the rows of the CSV file and transform them into an array of hashes.
      # Example:
      #
      #   [
      #     { 'email' => 'user@example.com', factor_values: { 10 => '60', 20 => '71' } }
      #   ]
      #
      # Each hash represents a user's scores with their email as the key and factor values as a nested hash,
      # where keys are campaign factor IDs and values are the corresponding scores.
      #
      def call
        processed_rows = rows.each_with_object([]) do |row, array|
          hash = { 'email' => row['Email'], 'factor_values' => {} }

          row.each do |header, column_value|
            next if header == 'Email' || column_value.blank?

            factor_id = campaign_factors[header]

            next if factor_id.blank?

            hash['factor_values'][factor_id] = column_value
          end

          array << hash
        end

        broadcast :ok, processed_rows
      end

      private

      def campaign_factors
        campaign_factor_codes = rows[0].keys.drop(1) # Skip the 'Email' column

        @campaign_factors ||= campaign.campaign_factors.where(code: campaign_factor_codes).pluck(:code, :id).to_h
      end
    end
  end
end

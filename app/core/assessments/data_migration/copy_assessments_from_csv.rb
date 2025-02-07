# frozen_string_literal: true

require 'csv'

module Assessments
  module DataMigration
    class CopyAssessmentsFromCsv < BaseCommand
      private_attr_reader :provider, :start_row, :csv_url

      HEADERS = ['User Email', 'To Campaign ID', 'From Campaign ID', 'Assessment ID'].freeze

      PROVIDER_MAPPINGS = {
        'saville' => 'Saville::MigrateAssessment',
        'hogan' => 'Hogan::CopyAssessment'
      }.freeze

      def initialize(provider, csv_url, start_row)
        @provider = provider
        @csv_url = csv_url
        # Assuming first row will be always header.
        # If no row number is specified, the default is the second row where data entries begin.
        @start_row = Integer(start_row || 2)
      end

      def call
        uri = URI(csv_url)
        content = if uri.scheme == 'https' || uri.scheme == 'http'
                    fetch_remote_file(uri)
                  else
                    read_local_file(uri.path)
                  end
        process_file_content(content)
      end

      private

      def fetch_remote_file(uri)
        response = Faraday.get(uri.to_s)
        raise "Failed to fetch remote file: #{response.status}" unless response.success?

        response.body
      rescue StandardError => e
        Rails.logger.error("Failed to fetch remote file: #{e.message}")
        raise
      end

      def read_local_file(path)
        File.read(path)
      rescue StandardError => e
        Rails.logger.error("Failed to read local file: #{e.message}")
        raise
      end

      def process_file_content(content)
        CSV.parse(content, headers: true).each.with_index(2) do |row, index|
          next if index < start_row

          validate_headers(row.headers)
          process_row(row, index)
        rescue StandardError => e
          Rails.logger.error("Row #{index}: Error - #{e.message}")
          raise e.message
        end
      end

      def validate_headers(file_headers)
        missing_headers = HEADERS - file_headers
        raise "Missing headers: #{missing_headers.join(', ')}" if missing_headers.any?
      end

      def process_row(row, index)
        email, to_campaign, from_campaign, assessment_id = row.values_at(*HEADERS)

        form = Assessments::DataMigration::CopyAssessmentForm.new(email:, to_campaign:, from_campaign:, assessment_id:)
        raise form.errors.full_messages.to_sentence unless form.valid?

        migrate_assessment(form, index)

        Rails.logger.info(
          "Row #{index}: #{email} with assessment #{assessment_id} \
          migrated from campaign (#{from_campaign} -> #{to_campaign})"
        )
      end

      def migrate_assessment(form, index)
        provider_class = PROVIDER_MAPPINGS[provider]
        raise "Unknown provider: #{provider}" unless provider_class

        provider_class.constantize.call!(form, index)
      end
    end
  end
end

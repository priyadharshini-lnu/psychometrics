# frozen_string_literal: true

require 'csv'

module Saville
  class CopyAssessmentsFromCsv < BaseCommand
    private_attr_reader :start_row, :csv_url

    HEADERS = ['User Email', 'To Campaign ID', 'From Campaign ID', 'Assessment ID'].freeze

    def initialize(csv_url, start_row)
      @csv_url = csv_url
      # Assuming first row will be always header.
      # If no row number is specified, the default is the second row where data entries begin.
      @start_row = Integer(start_row || 2)
    end

    def call
      uri = URI(csv_url)
      if uri.scheme == 'https' || uri.scheme == 'http'
        Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
          request = Net::HTTP::Get.new(uri)
          http.request(request) do |response|
            response.read_body do |chunk|
              process_file_content(chunk)
            end
          end
        end
      else
        File.open(uri.path, 'r') do |file|
          content = file.read
          process_file_content(content)
        end
      end
    end

    private

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

      form = Saville::MigrateAssessmentForm.new(email:, to_campaign:, from_campaign:, assessment_id:)
      raise form.errors.full_messages.to_sentence unless form.valid?

      Saville::MigrateAssessment.call!(form)

      Rails.logger.info(
        "Row #{index}: #{email} with assessment #{assessment_id} \
        migrated from campaign (#{from_campaign} -> #{to_campaign})"
      )
    end
  end
end

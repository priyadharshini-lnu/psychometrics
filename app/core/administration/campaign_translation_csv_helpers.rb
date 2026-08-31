# frozen_string_literal: true

module Administration
  module CampaignTranslationCsvHelpers
    private

    def headers
      @headers ||= csv_data.headers.map { |header| sanitize_value(header) }
    end

    def locale_headers
      @locale_headers ||= headers - [self.class::ID_FIELD]
    end

    def normalized_rows
      @normalized_rows ||= csv_data.map do |row|
        row.to_h.transform_keys { |key| sanitize_value(key) }
      end
    end

    def value_for(row, key)
      sanitize_value(row[key])
    end

    def locale_for_header(header)
      locale_code = header.to_s.split('/').last&.strip
      return nil if locale_code.blank?

      locale_code
    end

    def sanitize_value(value)
      Utility::String.remove_csv_injection_marker(value.to_s).strip
    end
  end
end

# frozen_string_literal: true

module Api
  module V2
    module Administration
      class CampaignTranslationImportForm
        include ActiveModel::Model
        include ::Administration::CampaignTranslationCsvHelpers

        ID_FIELD = 'Campaign ID'
        REQUIRED_FIELDS = [ID_FIELD].freeze
        CSV_CONTENT_TYPES = %w[text/csv application/csv].freeze

        attr_accessor :file, :project_id
        attr_reader :processed_file

        validates :file, presence: true
        validate :file_is_csv
        validate :validate_file_content
        validate :process_file

        def row_count
          @csv_data&.size || 0
        end

        private

        def file_is_csv
          return if file.blank?
          return if file.content_type.in?(CSV_CONTENT_TYPES)

          errors.add(:file, I18n.t('administration.campaigns.bulk_import_translations.errors.must_be_csv'))
        end

        def validate_file_content
          return if file.blank? || !file.content_type.in?(CSV_CONTENT_TYPES)

          parse_and_validate_csv
        rescue CSV::MalformedCSVError => e
          errors.add(:base, I18n.t('administration.campaigns.bulk_import_translations.errors.invalid_csv_format',
                                   message: e.message))
        ensure
          file.rewind if file.respond_to?(:rewind)
        end

        def parse_and_validate_csv
          missing_headers = REQUIRED_FIELDS - headers
          if missing_headers.any?
            errors.add(:base,
                       I18n.t('administration.campaigns.bulk_import_translations.errors.missing_required_columns',
                              columns: missing_headers.join(', ')))
            return
          end

          invalid_locales = locale_headers.filter_map do |header|
            validated_locale_for_header(header).nil? ? header : nil
          end
          if invalid_locales.any?
            errors.add(:base,
                       I18n.t('administration.campaigns.bulk_import_translations.errors.invalid_locales',
                              locales: invalid_locales.join(', ')))
          end

          normalized_rows.each_with_index do |row, index|
            row_number = index + 2
            campaign_id = value_for(row, ID_FIELD)

            next if campaign_id.present?

            errors.add(:base,
                       I18n.t('administration.campaigns.bulk_import_translations.errors.blank_campaign_id',
                              row: row_number))
          end
        end

        def process_file
          return if file.blank? || errors.present?

          @processed_file = file
        end

        def csv_data
          @csv_data ||= begin
            file.rewind if file.respond_to?(:rewind)
            ::CsvFileParser.call!(file, headers: true)
          end
        end

        def validated_locale_for_header(header)
          locale_code = locale_for_header(header)
          return nil if locale_code.blank?
          return locale_code if I18n.available_locales.map(&:to_s).include?(locale_code)

          nil
        end
      end
    end
  end
end

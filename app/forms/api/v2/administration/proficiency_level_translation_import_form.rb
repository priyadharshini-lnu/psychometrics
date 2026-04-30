# frozen_string_literal: true

module Api
  module V2
    module Administration
      class ProficiencyLevelTranslationImportForm
        include ActiveModel::Model

        REQUIRED_FIELDS = %w[ID].freeze

        attr_accessor :file, :project_id
        attr_reader :processed_file

        validates :file, presence: true
        validate :file_is_csv
        validate :validate_file_content
        validate :process_file

        def row_count
          @csv_data&.drop(1)&.size || 0
        end

        private

        def file_is_csv
          return if file.blank?
          return if file.content_type.in?(%w[text/csv application/csv])

          errors.add(:file, I18n.t('administration.proficiency_levels.translations.import.file.must_be_csv'))
        end

        def validate_file_content
          return if file.blank? || !csv_content_type?

          parse_and_validate_csv
        rescue CSV::MalformedCSVError => e
          errors.add(:base, I18n.t('administration.proficiency_levels.translations.import.errors.invalid_csv_format',
                                   message: e.message))
        ensure
          file.rewind if file.respond_to?(:rewind)
        end

        def csv_content_type?
          file.content_type.in?(%w[text/csv application/csv])
        end

        def parse_and_validate_csv
          file.rewind if file.respond_to?(:rewind)
          @csv_data = ::CsvFileParser.call!(file)
          headers = sanitize_headers(@csv_data.first)

          validate_required_columns(headers)
          validate_language_columns(headers)
          return if errors.present?

          @csv_data[1..]&.each_with_index do |row, index|
            validate_row(row.map { |c| Utility::String.remove_csv_injection_marker(c) }, headers, index + 2)
          end
        end

        def sanitize_headers(header_row)
          header_row&.map { |h| Utility::String.remove_csv_injection_marker(h.to_s) } || []
        end

        def validate_required_columns(headers)
          return if headers.include?('ID')

          errors.add(:base,
                     I18n.t('administration.proficiency_levels.translations.import.errors.missing_required_columns',
                            columns: 'ID'))
        end

        def validate_language_columns(headers)
          other_headers = headers - ['ID']
          invalid_locales = other_headers.reject do |header|
            # Split headers like "English / en" to get locale code
            locale_code = header.split('/').last&.strip
            locale_code && I18n.available_locales.include?(locale_code.to_sym)
          end

          return if invalid_locales.empty?

          errors.add(:base, I18n.t('administration.proficiency_levels.translations.import.errors.invalid_locales',
                                   locales: invalid_locales.join(', ')))
        end

        def validate_row(row, headers, row_number)
          return if row.blank?

          row_data = headers.zip(row).to_h

          if row_data['ID'].blank?
            errors.add(:base,
                       I18n.t('administration.proficiency_levels.translations.import.errors.row_id_blank',
                              row: row_number))
          end
        end

        def process_file
          return if file.blank?
          return if errors.present?

          @processed_file = file
        end
      end
    end
  end
end

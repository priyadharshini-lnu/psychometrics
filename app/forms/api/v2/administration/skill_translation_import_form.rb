# frozen_string_literal: true

module Api
  module V2
    module Administration
      class SkillTranslationImportForm
        include ActiveModel::Model

        REQUIRED_FIELDS = %w[ID Locale Name Description].freeze

        attr_accessor :file, :project_id
        attr_reader :processed_file

        validates :file, presence: true
        validate :file_is_csv
        validate :validate_file_content
        validate :process_file

        private

        def file_is_csv
          return if file.blank?
          return if file.content_type.in?(%w[text/csv application/csv])

          errors.add(:file, I18n.t('administration.skills.import.file.must_be_csv'))
        end

        # rubocop:disable Metrics/CyclomaticComplexity
        # rubocop:disable Metrics/PerceivedComplexity
        def validate_file_content
          return if file.blank?
          return unless file.content_type.in?(%w[text/csv application/csv])

          begin
            file.rewind if file.respond_to?(:rewind)
            csv_data = CSVSafe.parse(file.read)
            headers = csv_data.first&.map { |h| Utility::String.remove_csv_injection_marker(h) } || []

            # Check for required fields
            missing_fields = REQUIRED_FIELDS - headers
            if missing_fields.any?
              errors.add(:base, I18n.t('administration.skills.translations.import.errors.missing_required_columns',
                                       columns: missing_fields.join(', ')))
              return
            end

            # Validate each row
            csv_data[1..]&.each_with_index do |row, index|
              row_number = index + 2
              sanitized_row = row.map { |cell| Utility::String.remove_csv_injection_marker(cell) }
              validate_row(sanitized_row, headers, row_number)
            end
          rescue CSV::MalformedCSVError => e
            errors.add(:base, I18n.t('administration.skills.translations.import.errors.invalid_csv_format',
                                     message: e.message))
          ensure
            file.rewind if file.respond_to?(:rewind)
          end
        end

        def validate_row(row, headers, row_number)
          return if row.blank?

          row_data = headers.zip(row).to_h

          # Validate ID
          if row_data['ID'].blank?
            errors.add(:base, I18n.t('administration.skills.translations.import.errors.row_id_blank',
                                     row: row_number))

          end

          # Validate Locale
          if row_data['Locale'].blank?
            errors.add(:base, I18n.t('administration.skills.translations.import.errors.row_locale_blank',
                                     row: row_number))
          elsif I18n.available_locales.exclude?(row_data['Locale'].to_sym)
            errors.add(:base, I18n.t('administration.skills.translations.import.errors.row_locale_invalid',
                                     row: row_number, locale: row_data['Locale']))
          end

          # Validate Name
          if row_data['Name'].blank?
            errors.add(:base, I18n.t('administration.skills.translations.import.errors.row_name_blank',
                                     row: row_number))
          end

          # Validate Description
          if row_data['Description'].blank?
            errors.add(:base, I18n.t('administration.skills.translations.import.errors.row_description_blank',
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
# rubocop:enable Metrics/CyclomaticComplexity
# rubocop:enable Metrics/PerceivedComplexity

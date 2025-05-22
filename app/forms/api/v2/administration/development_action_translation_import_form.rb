# frozen_string_literal: true

module Api
  module V2
    module Administration
      class DevelopmentActionTranslationImportForm
        include ActiveModel::Model

        REQUIRED_FIELDS = %w[ID].freeze

        attr_accessor :file

        validates :file, presence: true
        validate :validate_file_format
        validate :validate_file_content

        def processed_file
          return nil unless valid?

          file
        end

        private

        def validate_file_format
          return if file.blank?
          return if file.respond_to?(:content_type) && file.content_type == 'text/csv'

          errors.add(:file, I18n.t('administration.development_action_translations.import.errors.invalid_file_format'))
        end

        def validate_file_content
          return if file.blank?
          return unless file.content_type.in?(%w[text/csv application/csv])

          begin
            file.rewind if file.respond_to?(:rewind)
            @csv_data = CSVSafe.parse(file.read, headers: true)
            headers = @csv_data.headers.map { |h| Utility::String.remove_csv_injection_marker(h.to_s) }

            # Check for required ID column
            first_header = headers.first
            if first_header != 'ID'
              errors.add(:base, I18n.t('administration.development_action_translations.import.errors.missing_columns',
                                       fields: 'ID'))
              return
            end

            # Make sure there's at least one language column
            if headers.size <= 1
              errors.add(:base, I18n.t('administration.development_action_translations.import.errors.missing_columns',
                                       fields: 'language columns'))
              return
            end

            @csv_data.each_with_index do |row, index|
              row_number = index + 2 # Adding 2 because index starts at 0 and we skip header row
              sanitized_data = sanitize_row_data(row.to_h)
              validate_row(sanitized_data, row_number)
            end
          rescue CSV::MalformedCSVError => e
            errors.add(:base, I18n.t('administration.development_action_translations.import.errors.invalid_csv_format',
                                     message: e.message))
          ensure
            file.rewind if file.respond_to?(:rewind)
          end
        end

        def sanitize_row_data(row_data)
          row_data.transform_values { |v| Utility::String.remove_csv_injection_marker(v.to_s) }
        end

        def validate_row(sanitized_data, row_number)
          validate_id_with_field(sanitized_data, row_number)
        end

        def validate_id_with_field(sanitized_data, row_number)
          id_with_field = sanitized_data['ID'].to_s

          if id_with_field.blank?
            errors.add(:base, I18n.t('administration.development_action_translations.import.errors.blank_id',
                                     row: row_number))
            return
          end

          unless id_with_field.include?('#')
            errors.add(:base, I18n.t('administration.development_action_translations.import.errors.invalid_id_format',
                                     row: row_number))
            return
          end

          id, field = id_with_field.split('#', 2)

          if id.blank? || !id.match?(/^\d+$/)
            errors.add(:base, I18n.t('administration.development_action_translations.import.errors.invalid_id',
                                     row: row_number))
          end

          unless %w[Name Description].include?(field)
            errors.add(:base, I18n.t('administration.development_action_translations.import.errors.invalid_field',
                                     row: row_number, field: field))
          end
        end

        def process_file
          return if file.blank?
          return if errors.present?

          @processed_file = file.tempfile
        end
      end
    end
  end
end

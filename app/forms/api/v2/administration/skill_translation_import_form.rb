# frozen_string_literal: true

module Api
  module V2
    module Administration
      class SkillTranslationImportForm
        include ActiveModel::Model

        REQUIRED_FIELDS = %w[ID].freeze

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

        def validate_file_content
          return if file.blank?
          return unless file.content_type.in?(%w[text/csv application/csv])

          begin
            file.rewind if file.respond_to?(:rewind)
            csv_data = CSVSafe.parse(file.read, headers: true)

            # Check for required fields
            validate_headers(csv_data.headers)
            if errors.present?
              return
            end

            # Validate CSV structure
            validate_row_format(csv_data)
          rescue CSV::MalformedCSVError => e
            errors.add(:base, I18n.t('administration.skills.translations.import.errors.invalid_csv_format',
                                     message: e.message))
          ensure
            file.rewind if file.respond_to?(:rewind)
          end
        end

        def validate_headers(headers)
          sanitized_headers = headers&.map { |h| Utility::String.remove_csv_injection_marker(h) } || []
          missing_fields = REQUIRED_FIELDS - sanitized_headers
          if missing_fields.any?
            errors.add(:base, I18n.t('administration.skills.translations.import.errors.missing_columns',
                                     columns: missing_fields.join(', ')))
          end
        end

        def validate_row_format(csv_data)
          csv_data.each_with_index do |row, index|
            row_number = index + 2
            row_data = row.to_h.transform_values do |value|
              Utility::String.remove_csv_injection_marker(value.to_s.strip)
            end

            id_field = row_data['ID']
            next if id_field.blank?

            # Format is expected to be like "123#Name" or "123#Description"
            parts = id_field.split('#')
            unless parts.size == 2
              errors.add(:base, I18n.t('administration.skills.translations.import.errors.invalid_id_format',
                                       row: row_number, id: id_field))
              next
            end

            parts[0]
            field_type = parts[1]

            # Validate field_type is either 'Name' or 'Description'
            unless %w[Name Description].include?(field_type)
              errors.add(:base, I18n.t('administration.skills.translations.import.errors.invalid_field_type',
                                       row: row_number, field_type: field_type))
            end
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

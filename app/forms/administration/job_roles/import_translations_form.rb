# frozen_string_literal: true

module Administration
  module JobRoles
    class ImportTranslationsForm < Rectify::Form
      mimic :job_roles_translations_form

      REQUIRED_FIELDS = %w[ID Locale Name Description].freeze

      attribute :file, Object
      attribute :project_id, Integer

      validates :project_id, presence: true
      validates :file, presence: true,
                file_content_type: {
                  allow: [
                    'text/csv', 'application/csv'
                  ],
                  message: :invalid_format
                }

      validate :validate_project_exists
      validate :validate_file_content, if: :parsed_file

      def processed_file
        return nil unless valid?

        file
      end

      private

      def validate_project_exists
        return if project_id.nil?
        return if project.present?

        errors.add(:project, :must_exist)
      end

      def parsed_file
        @parsed_file ||= begin
          file.rewind if file.respond_to?(:rewind)
          result = CSVSafe.parse(file.read)
          file.rewind if file.respond_to?(:rewind)
          result
        end
      rescue StandardError
        errors.add(:file, :parsing_failed, error: e.message)

        nil
      end

      def validate_file_content
        headers = parsed_file.first&.map { |h| Utility::String.remove_csv_injection_marker(h) } || []

        missing_fields = REQUIRED_FIELDS - headers
        if missing_fields.any?
          errors.add(:file, :missing_required_columns, columns: missing_fields.join(', '))
          return
        end

        parsed_file[1..]&.each_with_index do |row, index|
          row_number = index + 2
          sanitized_row = row.map { |cell| Utility::String.remove_csv_injection_marker(cell) }
          validate_row(sanitized_row, headers, row_number)
        end
      end

      def validate_row(row, headers, row_number)
        return if row.blank?

        row_data = headers.zip(row).to_h

        # Validate ID
        if row_data['ID'].blank?
          errors.add(:file, :column_cannot_be_blank, column_name: 'ID', row_number: row_number)

        elsif !JobRole.exists?(id: row_data['ID'], project_id: project_id)
          errors.add(:file, :invalid_job_role_id, id: row_data['ID'], row_number: row_number)
        end

        # Validate Locale
        if row_data['Locale'].blank?
          errors.add(:file, :column_cannot_be_blank, column_name: 'Locale', row_number: row_number)
        elsif I18n.available_locales.exclude?(row_data['Locale'].to_sym)
          errors.add(:file, :invalid_locale, row_number: row_number, locale: row_data['Locale'])
        end

        # Validate Name
        if row_data['Name'].blank?
          errors.add(:file, :column_cannot_be_blank, column_name: 'Name', row_number: row_number)
        end

        # Validate Description
        if row_data['Description'].blank?
          errors.add(:file, :column_cannot_be_blank, column_name: 'Description', row_number: row_number)
        end
      end

      def project
        @project ||= ::Project.find_by(id: project_id)
      end
    end
  end
end

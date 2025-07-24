# frozen_string_literal: true

module Api
  module V2
    module Administration
      class DevelopmentActionImportForm
        include ActiveModel::Model

        REQUIRED_FIELDS = %w[SkillID Name Description Type DevelopmentActionType].freeze
        OPTIONAL_FIELDS = %w[ID CourseURL CourseStartDate CourseEndDate CourseImage].freeze
        VALID_DEVELOPMENT_ACTION_TYPES = %w[course default].freeze
        VALID_LEARNING_STYLES = %w[structured_learning learning_from_others on_the_job].freeze

        attr_accessor :file, :project_id

        validates :file, presence: true
        validate :validate_file_format
        validate :validate_file_content

        private

        def validate_file_format
          return if file.blank?
          return if file.respond_to?(:content_type) && file.content_type == 'text/csv'

          errors.add(:file, I18n.t('administration.development_action_import.errors.csv_file_required'))
        end

        def validate_file_content
          return if file.blank?
          return unless file.respond_to?(:content_type) && file.content_type == 'text/csv'

          begin
            file.rewind if file.respond_to?(:rewind)
            @csv_data = ::CsvFileParser.call!(file)
            @available_locales = I18n.available_locales.map(&:to_s)
            extract_headers_and_rows
            validate_headers
            validate_data
          rescue CSV::MalformedCSVError => e
            errors.add(:base,
                       I18n.t('administration.development_action_import.errors.invalid_csv_format', message: e.message))
          ensure
            file.rewind if file.respond_to?(:rewind)
          end
        end

        def extract_headers_and_rows
          @headers = @csv_data.first || []
          @rows = @csv_data.drop(1)
          @row_hashes = @rows.map { |row| @headers.zip(row).to_h }
        end

        def validate_headers
          missing_fields = REQUIRED_FIELDS - @headers
          if missing_fields.any?
            errors.add(:base,
                       I18n.t('administration.development_action_import.errors.missing_columns',
                              fields: missing_fields.join(', ')))
          end
        end

        def validate_data
          return if errors.any?

          @row_hashes.each_with_index do |row_hash, index|
            row_number = index + 2 # Add 2 because index starts at 0 and we skipped header row
            validate_row(row_hash, row_number)
          end
        end

        def validate_row(row, row_number)
          validate_required_fields(row, row_number)
          validate_learning_style(row, row_number)
          validate_dates(row, row_number)
          validate_development_action_type(row, row_number)
          validate_duration(row, row_number)
          validate_available_languages(row, row_number)
          validate_development_action_belongs_to_project(row, row_number)
        end

        def validate_available_languages(row, row_number)
          langs = row['AvailableLanguages'].to_s.split(',').map(&:strip).compact_blank
          return if langs.empty?

          unless row['DevelopmentActionType'].to_s.downcase == 'course'
            errors.add(
              :base,
              I18n.t('administration.development_action_import.errors.languages_only_for_courses', row: row_number)
            )
            return
          end

          invalid_languages = langs - @available_locales
          if invalid_languages.any?
            errors.add(
              :base,
              I18n.t(
                'administration.development_action_import.errors.invalid_languages',
                row: row_number,
                invalid_languages: invalid_languages.join(', ')
              )
            )
          end
        end

        def validate_duration(row, row_number)
          duration = row['Duration']
          return if duration.blank?

          unless duration.to_s.match?(/\A\d+\z/)
            errors.add(
              :base,
              I18n.t(
                'administration.development_action_import.errors.invalid_duration_format',
                row: row_number,
                value: duration
              )
            )
          end
        end

        def validate_required_fields(row, row_number)
          REQUIRED_FIELDS.each do |field|
            if row[field].blank?
              errors.add(:base, I18n.t('administration.development_action_import.errors.blank_field',
                                       row: row_number, field: field))
            end
          end
        end

        def validate_learning_style(row, row_number)
          return if row['Type'].blank?

          unless VALID_LEARNING_STYLES.include?(row['Type'].to_s.downcase)
            errors.add(:base, I18n.t('administration.development_action_import.errors.invalid_learning_style',
                                     row: row_number,
                                     value: row['Type'],
                                     valid_types: VALID_LEARNING_STYLES.join(', ')))
          end
        end

        def validate_dates(row, row_number)
          %w[CourseStartDate CourseEndDate].each do |date_field|
            next if row[date_field].blank?

            begin
              Date.parse(row[date_field])
            rescue Date::Error
              errors.add(:base, I18n.t('administration.development_action_import.errors.invalid_date_format',
                                       row: row_number, field: date_field))
            end
          end
        end

        def validate_development_action_type(row, row_number)
          return if row['DevelopmentActionType'].blank?

          unless VALID_DEVELOPMENT_ACTION_TYPES.include?(row['DevelopmentActionType'].to_s.downcase)
            errors.add(:base, I18n.t('administration.development_action_import.errors.invalid_development_action_type',
                                     row: row_number,
                                     value: row['DevelopmentActionType'],
                                     valid_development_action_types: VALID_DEVELOPMENT_ACTION_TYPES.join(', ')))
          end
        end

        def validate_development_action_belongs_to_project(row, row_number)
          return if row['ID'].blank? || project_id.blank?

          development_action = ::DevelopmentAction.find_by(id: row['ID'])
          if development_action.present? && development_action.project_id != project_id
            errors.add(
              :base,
              I18n.t(
                'administration.development_action_import.errors.development_action_not_in_project',
                row: row_number,
                development_action_id: row['ID']
              )
            )
          end
        end
      end
    end
  end
end

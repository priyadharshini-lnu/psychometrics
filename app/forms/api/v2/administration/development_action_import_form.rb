# frozen_string_literal: true

module Api
  module V2
    module Administration
      class DevelopmentActionImportForm
        include ActiveModel::Model

        REQUIRED_FIELDS = %w[SkillID Name Description Type Category].freeze
        OPTIONAL_FIELDS = %w[ID CourseURL CourseStartDate CourseEndDate CourseImage].freeze
        VALID_CATEGORIES = %w[course default].freeze

        attr_accessor :file

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
            validate_headers
            validate_data
          rescue CSV::MalformedCSVError => e
            errors.add(:base,
                       I18n.t('administration.development_action_import.errors.invalid_csv_format', message: e.message))
          ensure
            file.rewind if file.respond_to?(:rewind)
          end
        end

        def validate_headers
          headers = @csv_data.first || []
          missing_fields = REQUIRED_FIELDS - headers
          if missing_fields.any?
            errors.add(:base,
                       I18n.t('administration.development_action_import.errors.missing_columns',
                              fields: missing_fields.join(', ')))
          end
        end

        def validate_data
          return if errors.any?

          @csv_data.drop(1).each_with_index do |row, index|
            row_number = index + 2 # Add 2 because index starts at 0 and we skipped header row
            headers = @csv_data.first
            row_hash = headers.zip(row).to_h
            validate_row(row_hash, row_number)
          end
        end

        def validate_row(row, row_number)
          validate_required_fields(row, row_number)
          validate_learning_style(row, row_number)
          validate_dates(row, row_number)
          validate_category(row, row_number)
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

          unless %w[structured_learning learning_from_others on_the_job].include?(row['Type'].downcase)
            errors.add(:base, I18n.t('administration.development_action_import.errors.invalid_learning_style',
                                     row: row_number,
                                     value: row['Type'],
                                     valid_types: 'structured_learning, learning_from_others, on_the_job'))
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

        def validate_category(row, row_number)
          return if row['Category'].blank?

          unless VALID_CATEGORIES.include?(row['Category'].downcase)
            errors.add(:base, I18n.t('administration.development_action_import.errors.invalid_category',
                                     row: row_number,
                                     value: row['Category'],
                                     valid_categories: VALID_CATEGORIES.join(', ')))
          end
        end
      end
    end
  end
end

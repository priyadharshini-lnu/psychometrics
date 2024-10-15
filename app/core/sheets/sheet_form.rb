# frozen_string_literal: true

module Sheets
  class SheetForm < Rectify::Form
    FIRST_DATA_ROW = 3

    attribute :file, Object

    validates :file, presence: true,
                     file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                  'application/xlsx'], message: :invalid_format }
    validate :has_email_column, if: :file
    validate :check_column_types, if: :file
    validate :check_columns_names_and_length, if: -> { file && accesssheet? }
    validate :validates_emails, if: :file
    validate :no_duplicates, if: -> { file && sheet_type == 'Datasheet' }
    validate :validate_string_values, if: :file
    validate :validate_numeric_values, if: :file
    validate :validate_column_types_matching, if: -> { file && sheet }
    validate :validate_column_names_uniqueness, if: :file

    def roo_excel
      @roo_excel ||= file.is_a?(Roo::Excelx) ? file : Roo::Excelx.new(file.path)
    end

    def parsed_file
      @parsed_file ||= roo_excel.parse(headers: true, clean: false)
    end

    def data_rows
      @data_rows ||= parsed_file[2..] || []
    end

    private

    def sheet_type
      context.sheet_type
    end

    def accesssheet?
      sheet_type == 'Accesssheet'
    end

    def validate_column_types_matching
      sheet.sheet_columns.each do |column|
        type = columns[column.name]
        if type && type != column.humanize_type
          errors.add(:file, :column_type_mismatch, col: column.name, type: column.humanize_type, got: type)
        end
      end
    end

    def validate_string_values
      string_columns = columns.select { |_, type| type == 'String' }.keys

      data_rows.each.with_index do |data, index|
        string_columns.each do |column|
          next if data[column].blank?

          unless data[column].is_a?(String)
            next errors.add(:file, :invalid_string_value, column: column, index: row_number(index))

          end

          if data[column].size > 256
            errors.add(:file, :invalid_string_value_size, column: column, index: row_number(index))
          end
        end
      end
    end

    def validate_numeric_values
      numeric_columns = columns.select { |_, type| type == 'Number' }.keys

      data_rows.each.with_index do |data, index|
        numeric_columns.each do |column|
          if data[column].present? && !data[column].is_a?(Numeric)
            errors.add(:file, :invalid_number_value, column: column, index: row_number(index))
          end
        end
      end
    end

    # Checks if there is column Email Address in file
    #
    def has_email_column # rubocop:disable Naming/PredicateName
      errors.add(:file, :no_email_column) unless parsed_file.first.key?(Sheet::EMAIL_COLUMN)
    end

    def check_column_types
      return errors.add(:file, :invalid_column_type)  if parsed_file.second.blank?

      invalid_column = parsed_file.second.values.any? { |column| Sheet::ALL_COLUMN_TYPES.exclude?(column) }
      errors.add(:file, :invalid_column_type) if invalid_column
    end

    def check_columns_names_and_length
      column_names.each do |name|
        if name && name.size > Sheet::MAX_COLUMN_NAME_SIZE
          errors.add(:file, :invalid_column_name_size, column: name)
        end

        errors.add(:file, :invalid_column_name, column: name) unless RegexConstants::SHEET_COLUMN_REGEX.match?(name)
      end
    end

    def validates_emails
      return if errors.present?

      data_rows.each.with_index do |data, index|
        email = data[Sheet::EMAIL_COLUMN]
        next errors.add(:file, :email_blank, row_number: row_number(index)) if email.blank?

        errors.add(:file, :email_invalid, row_number: row_number(index)) unless Devise.email_regexp.match?(email.strip)
      end
    end

    def validate_column_names_uniqueness
      column_names = roo_excel.first
      non_uniq_columns = column_names.select { |c| column_names.count(c) > 1 }
      return if non_uniq_columns.empty?

      errors.add(:file, :non_uniq_column, columns: non_uniq_columns.uniq.join(', '))
    end

    def row_number(index)
      FIRST_DATA_ROW + index
    end

    def columns
      @columns ||= column_names.zip(column_types).to_h
    end

    def column_names
      @column_names ||= parsed_file.first.keys
    end

    def column_types
      @column_types ||= parsed_file.second.values
    end

    # Checks if there is duplicates in email column
    #
    def no_duplicates
      errors.add(:file, :email_duplicate) if parsed_file.
                                             map { |item| item[Sheet::EMAIL_COLUMN]&.strip&.downcase }.
                                             compact_blank.
                                             uniq!
    end

    def sheet
      context&.sheet
    end
  end
end

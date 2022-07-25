# frozen_string_literal: true

module Sheets
  class SheetForm < Rectify::Form
    attribute :file, Object

    validates :file, presence: true,
                     file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                  'application/xlsx'], message: :invalid_format }
    validate :has_email_column, if: :file
    validate :check_column_types, if: :file
    validate :check_columns_names_and_length, if: :file
    validate :check_emails_are_present, if: :file
    validate :no_duplicates, if: :file
    validate :validate_string_values, if: :file
    validate :validate_numeric_values, if: :file
    validate :validate_column_types_matching, if: -> { file && sheet }

    def parsed_file
      roo_excel = file.is_a?(Roo::Excelx) ? file : Roo::Excelx.new(file.path)

      @parsed_file ||= roo_excel.parse(headers: true, clean: false)
    end

    def data_rows
      @data_rows ||= parsed_file[2..-1] || []
    end

    private

    def validate_column_types_matching
      sheet.columns.each do |column|
        type = columns[column['name']]
        if type != column['type']
          errors.add(:file, :column_type_mismatch, col: column['name'], type: column['type'], got: type)
        end
      end
    end

    def validate_string_values
      string_columns = columns.select { |_, type| type == 'String' }.keys

      data_rows.each.with_index do |data, index|
        string_columns.each do |column|
          next if data[column].blank?

          unless data[column].is_a?(String)
            next errors.add(:file, :invalid_string_value, { column: column, index: 3 + index })

          end

          if data[column].size > 256
            errors.add(:file, :invalid_string_value_size, column: column, index: 3 + index)
          end
        end
      end
    end

    def validate_numeric_values
      numeric_columns = columns.select { |_, type| type == 'Number' }.keys

      data_rows.each.with_index do |data, index|
        numeric_columns.each do |column|
          if data[column].present? && !data[column].is_a?(Numeric)
            errors.add(:file, :invalid_number_value, column: column, index: 3 + index)
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

        errors.add(:file, :invalid_column_name, { column: name }) unless /\A[\w\s]+\z/.match?(name)
      end
    end

    def check_emails_are_present
      return if errors.present?

      data_rows.each.with_index do |data, index|
        errors.add(:file, :email_blank, row_number: index + 3) if data[Sheet::EMAIL_COLUMN]&.strip.blank?
      end
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
                                             reject(&:blank?).
                                             uniq!
    end

    def sheet
      context&.sheet
    end
  end
end

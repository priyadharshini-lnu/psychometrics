# frozen_string_literal: true

module Datasheets
  class DatasheetForm < Rectify::Form
    attribute :file, Object
    attribute :operation, String

    validates :file, presence: true,
                     file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                  'application/xlsx'], message: :invalid_format }
    validate :has_email_column, if: :file
    validate :check_column_types, if: :file
    validate :check_emails_are_present, if: :file
    validate :no_duplicates, if: :file

    def parsed_file
      roo_excel = file.is_a?(Roo::Excelx) ? file : Roo::Excelx.new(file.path)

      @parsed_file ||= roo_excel.parse(headers: true, clean: false)
    end

    def replace_existing?
      operation == 'replace_existing'
    end

    private

    # Checks if there is column Email Address in file
    #
    def has_email_column # rubocop:disable Naming/PredicateName
      errors.add(:file, :no_email_column) unless parsed_file.first.key?(Datasheet::EMAIL_COLUMN)
    end

    def check_column_types
      return errors.add(:file, :invalid_column_type)  if parsed_file.second.blank?

      invalid_column = parsed_file.second.values.any? { |column| Datasheet::ALL_COLUMN_TYPES.exclude?(column) }
      errors.add(:file, :invalid_column_type) if invalid_column
    end

    def check_emails_are_present
      return if errors.present?

      parsed_file[2..-1].each.with_index do |data, index|
        errors.add(:file, :email_blank, row_number: index + 3) if data[Datasheet::EMAIL_COLUMN]&.chomp.blank?
      end
    end

    # Checks if there is duplicates in email column
    #
    def no_duplicates
      errors.add(:file, :email_duplicate) if parsed_file.
                                             map { |item| item[Datasheet::EMAIL_COLUMN] }.
                                             reject(&:blank?).
                                             uniq!
    end
  end
end

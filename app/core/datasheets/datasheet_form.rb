# frozen_string_literal: true

module Datasheets
  class DatasheetForm < Rectify::Form
    attribute :file, Object

    validates :file, presence: true,
                     file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                  'application/xlsx'], message: :invalid_format }
    validate :has_email_column, if: :file
    validate :no_duplicates, if: :file

    def parsed_file
      @parsed_file ||= Roo::Excelx.new(file.path).parse(headers: :first_row, clean: true)
    end

    private

    # Checks if there is column Email Address in file
    #
    def has_email_column
      errors.add(:file, :no_email_column) unless parsed_file.first.keys.include? Datasheet::EMAIL_COLUMN
    end

    # Checks if there is duplicates in email column
    #
    def no_duplicates
      errors.add(:file, :email_duplicate) unless parsed_file.
                                                 map { |item| item[Datasheet::EMAIL_COLUMN] }.
                                                 reject(&:blank?).
                                                 uniq!.
                                                 nil?
    end
  end
end

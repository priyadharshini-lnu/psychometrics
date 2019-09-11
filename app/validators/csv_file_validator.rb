# frozen_string_literal: true

class CsvFileValidator < ActiveModel::EachValidator
  VALID_CONTENT_TYPES = ['text/csv', 'application/vnd.ms-excel', 'application/octet-stream'].freeze

  def validate_each(record, attribute, value)
    validate_mime_type(record, attribute, value)
    validate_extension(record, attribute, value)
  end

  private

  def validate_mime_type(record, attribute, file)
    add_errors(record, attribute) unless VALID_CONTENT_TYPES.include?(file.content_type)
  end

  def validate_extension(record, attribute, file)
    extension = File.extname(file.original_filename).downcase

    add_errors(record, attribute) unless extension == '.csv'
  end

  def add_errors(record, attribute)
    record.errors[attribute] << 'File should be of type csv'
  end
end

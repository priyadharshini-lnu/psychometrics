# frozen_string_literal: true

class CsvInjectionCheckValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return if value.blank?

    if starts_with_invalid_characters?(value)
      record.errors.add(
        attribute,
        :starts_with_invalid_characters,
        message: I18n.t('common.errors.csv_injection_validation_error')
      )
    end
  end

  def starts_with_invalid_characters?(value)
    value.match?(::RegexConstants::DANGEROUS_CSV_EXPORT_START_CHARS)
  end
end

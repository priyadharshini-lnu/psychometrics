# frozen_string_literal: true

class CsvInjectionCheckValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return if value.blank?

    if starts_with_invalid_characters?(value)
      record.errors.add(
        attribute,
        I18n.t('activemodel.errors.models.user.attributes.name.starts_with_invalid_characters')
      )
    end
  end

  def starts_with_invalid_characters?(value)
    value.match?(::RegexConstants::DANGEROUS_CSV_EXPORT_START_CHARS)
  end
end

# frozen_string_literal: true

class RepeatsInPasswordValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return if value.blank?

    is_invalid = Utility::String.has_repeated_substring?(value, max_occurrence: 3, min_substring_length: 1) ||
                 Utility::String.has_repeated_substring?(value, max_occurrence: 2, min_substring_length: 3) ||
                 Utility::String.has_sequence?(value)
    if is_invalid
      record.errors.add(attribute, I18n.t('activemodel.errors.models.profile.attributes.password.contains_repeats'))
    end
  end
end

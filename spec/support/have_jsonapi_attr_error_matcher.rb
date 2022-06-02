# frozen_string_literal: true

RSpec::Matchers.define :have_jsonapi_attr_error do
  match do
    next false if no_attributes?

    attribute_with_errors.blank?
  end

  failure_message do
    if no_attributes?
      'Expected data/attributes to be present'
    else
      errors = []
      attribute_with_errors.each do |k, v|
        errors <<
          "Expected attribute '#{k}' to be have errors #{v[:expected_error]} but it was #{v[:actual_error] || 'empty'}"
      end
      errors.join("\n")
    end
  end

  def no_attributes?
    @no_attributes ||=
      actual.errors.find { |error| error.path == [:data] || error.path == %i[data attributes] }.present?
  end

  def attribute_with_errors
    errors = actual.errors.to_h
    @attribute_with_errors ||= expected.each_with_object({}) do |(attr, error), acc|
      actual_error = errors.dig(:data, :attributes, attr)
      expected_error = error

      if actual_error&.sort != expected_error.sort
        acc[attr] = { expected_error: expected_error, actual_error: actual_error }
      end
    end
  end
end

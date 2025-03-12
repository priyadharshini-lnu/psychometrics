# frozen_string_literal: true

RSpec::Matchers.define :have_jsonapi_relationship_error do
  match do
    next false if no_relationships?

    relationship_with_errors.blank?
  end

  failure_message do
    if no_relationships?
      'Expected data/relationships to be present'
    else
      errors = relationship_with_errors.map do |k, v|
        "Expected relationship '#{k}' to be have errors #{v[:expected_error]} but it was #{v[:actual_error] || 'empty'}"
      end
      errors.join("\n")
    end
  end

  def no_relationships?
    @no_relationships ||=
      actual.errors.find { |error| [[:data], %i[data relationships]].include?(error.path) }.present?
  end

  def relationship_with_errors
    errors = actual.errors.to_hash

    @relationship_with_errors ||= expected.each_with_object({}) do |(relationship, expected_error), acc|
      actual_error = errors.dig(:data, :relationships, relationship)
      actual_error = actual_error[:data] if actual_error.is_a?(Hash) || actual_error.nil?

      if actual_error != expected_error
        acc[relationship] = { expected_error: expected_error, actual_error: actual_error }
      end
    end
  end
end

# frozen_string_literal: true

module Assessors
  class CreateAllForm < Rectify::Form
    attribute :assessors, Array

    validate :no_duplicates
    validate :assessor_fields

    def no_duplicates
      if assessors.map do |assessor|
        "#{assessor[:subject_email]}/#{assessor[:assessor_email]}"
      end.uniq.size != assessors.size
        errors.add(:assessors, :email_duplicated)
      end
    end

    def assessor_fields
      assessors.each.with_index do |assessor, index|
        form = CreateOneForm.new(assessor).with_context(context)
        errors.add(:assessors, "[Row #{index + 1}] #{form.errors.messages.values.first.first}") if form.invalid?
      end
    end
  end
end

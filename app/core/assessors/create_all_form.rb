# frozen_string_literal: true

module Assessors
  class CreateAllForm < Rectify::Form
    attribute :assessors, Array

    validate :no_duplicates
    validate :assessor_fields
    validate :single_lead_assessor_assessment_for_subject

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

    def single_lead_assessor_assessment_for_subject
      lead_assessor_assessment_id = Assessment.find_by(
        id: assessors.pluck(:assessment_ids).flatten.uniq, category: Assessment::CATEGORIES[:lead_assessor_form]
      )&.id

      return unless lead_assessor_assessment_id

      assessment_ids_by_subject = assessors.
                                  group_by { |assessor| assessor[:subject_email] }.
                                  transform_values { |assessor| assessor.pluck(:assessment_ids).flatten }

      if assessment_ids_by_subject.values.detect do |assessment_ids|
        assessment_ids.count(lead_assessor_assessment_id) > 1
      end
        errors.add(:assessors, :multiple_leads_for_subject)
      end
    end
  end
end

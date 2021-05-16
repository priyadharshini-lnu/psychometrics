# frozen_string_literal: true

FactoryBot.define do
  factory :hogan_assessment_setting do
    assessment
    hogan_form_id { 1 }
    hogan_assessment_id { 'HPI' }
  end
end

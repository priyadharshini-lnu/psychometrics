# frozen_string_literal: true

FactoryGirl.define do
  factory :hogan_assessment_setting do
    assessment
    hogan_form_id 1
    sequence(:hogan_assessment_id) { |i| "AID#{i}" }
  end
end

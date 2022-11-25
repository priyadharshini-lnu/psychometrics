# frozen_string_literal: true

FactoryBot.define do
  factory :saville_user_assessment do
    user_assessment

    after(:create) do |ua|
      ua.user_assessment.assessment.update(type: 'Assessments::Saville')
    end
  end
end

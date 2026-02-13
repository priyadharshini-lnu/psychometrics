# frozen_string_literal: true

FactoryBot.define do
  factory :user_assessment_verification_medium do
    user_assessment_id { 1 }
    media_type { 'video' }
  end
end

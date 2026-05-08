# frozen_string_literal: true

FactoryBot.define do
  factory :mhs_user_assessment do
    user_assessment
    norm_region { 6 }
  end
end

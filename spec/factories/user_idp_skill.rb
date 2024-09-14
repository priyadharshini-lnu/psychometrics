# frozen_string_literal: true

FactoryBot.define do
  factory :user_idp_skill do
    user_idp_plan
    skill
  end
end

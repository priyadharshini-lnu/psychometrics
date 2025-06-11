# frozen_string_literal: true

FactoryBot.define do
  factory :user_idp_comment do
    content { 'This is a comment.' }
    created_by { association :user }
  end
end

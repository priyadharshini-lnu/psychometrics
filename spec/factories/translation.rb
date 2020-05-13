# frozen_string_literal: true

FactoryBot.define do
  factory :translation do
    locale { 'en' }
    props { '{}' }

    association :translateable
    association :resource
  end
end

# frozen_string_literal: true

FactoryGirl.define do
  factory :privacy_link do
    association :client, factory: :tenancy
    text 'Privacy link'
    link 'privacy.cc.com'
  end
end

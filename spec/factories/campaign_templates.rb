# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_template do
    name { 'MyString' }
    assessment
    report
  end
end

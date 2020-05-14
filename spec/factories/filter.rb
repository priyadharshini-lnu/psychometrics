# frozen_string_literal: true

FactoryBot.define do
  factory :filter, class: 'Reports::Filter' do
    report
  end
end

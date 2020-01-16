# frozen_string_literal: true

FactoryGirl.define do
  factory :filter, class: 'Reports::Filter' do
    report
  end
end

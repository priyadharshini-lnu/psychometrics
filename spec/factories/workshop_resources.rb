# frozen_string_literal: true

FactoryBot.define do
  factory :workshop_resource do
    workshop
    name { 'Resource name' }
    url { 'http://resource.com' }
  end
end

# frozen_string_literal: true

FactoryBot.define do
  factory :relationship do
    name { 'Manager' }
    type { :global }
  end
end

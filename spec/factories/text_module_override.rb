# frozen_string_literal: true

FactoryBot.define do
  factory :text_module_override do
    content { 'hello world' }
    module_id { 1 }
  end
end

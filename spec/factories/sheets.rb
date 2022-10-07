# frozen_string_literal: true

FactoryBot.define do
  factory :sheet, aliases: [:datasheet] do
    project { nil }
    columns { [{ name: 'Email', type: 'String' }] }
    type { 'Datasheet' }
  end
end

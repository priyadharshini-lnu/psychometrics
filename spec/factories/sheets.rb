# frozen_string_literal: true

FactoryBot.define do
  factory :sheet, class: Datasheet do
    project { nil }
    columns { [{ name: 'Email', type: 'String' }] }

    factory :datasheet, class: Datasheet do
      type { Datasheet }
    end
  end
end

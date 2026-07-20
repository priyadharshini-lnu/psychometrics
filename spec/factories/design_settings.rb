# frozen_string_literal: true

FactoryBot.define do
  factory :design_setting do
    association :client, factory: :tenancy
    login_box_position { 'auto' }
    background_color { '#ff0000' }
  end
end

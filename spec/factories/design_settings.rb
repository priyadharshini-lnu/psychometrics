# frozen_string_literal: true

FactoryBot.define do
  factory :design_setting do
    login_box_position { 'auto' }
    background_color { '#ff0000' }
    secondary_logo { '#ff0000' }
  end
end

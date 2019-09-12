# frozen_string_literal: true

# == Schema Information
#
# Table name: innovation_styles
#
#  id          :bigint(8)        not null, primary key
#  name        :string
#  icon        :string
#  description :text
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

FactoryGirl.define do
  factory :innovation_style do
    sequence(:name) { |i| "IS #{i}" }
    sequence(:description) { |j| "Innovation Style #{j}" }
    dimension
  end
end

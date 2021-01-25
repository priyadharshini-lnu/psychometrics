# frozen_string_literal: true

# == Schema Information
#
# Table name: factors_norms
#
#  id        :integer          not null, primary key
#  type      :enum
#  factor_id :integer
#  norm_id   :integer
#  props     :json
#

FactoryBot.define do
  factory :factors_norm do
    factor
    norm

    props do
      FactorsNorm::LEVELS.map do |level|
        to = rand(2..10)
        from = rand(1...to)
        { level: level, score_from: from, score_to: to }
      end
    end

    trait :percentile do
      props do
        [{ mean: rand(1.0..5.0).round(1), standard_deviation: rand(1.0..5.0).round(1) }]
      end
    end
  end
end

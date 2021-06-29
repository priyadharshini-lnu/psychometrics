# frozen_string_literal: true

FactoryBot.define do
  factory :saville_factor do
    factor_id { SecureRandom.uuid }
    assessment_id { SecureRandom.uuid }
    name { 'FactorName' }
    score_type { 'Nipsative' }
    value_type { 'percentile' }
  end
end

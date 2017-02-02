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

FactoryGirl.define do
  factory :factors_norm do
    factor
    norm
    type { FactorsNorm::NORM_TYPES.sample }

    props do
      FactorsNorm::LEVELS.map do |level|
        to = rand(2..10)
        from = rand(1...to)
        { level: level, score_from: from, score_to: to }
      end
    end
  end
end

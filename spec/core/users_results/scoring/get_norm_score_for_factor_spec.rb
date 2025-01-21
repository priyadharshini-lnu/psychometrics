# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::Scoring::GetNormScoreForFactor do
  let(:five_scale_norm) { create(:norm, with_factors_norm: false, norm_type: :five_scale) }
  let(:percentile_norm) { create(:norm, with_factors_norm: false, norm_type: :percentile) }
  let(:norm_props) do
    [
      { 'score_from' => '1.0', 'score_to' => '1.99', 'level' => 'Very Low' },
      { 'score_from' => '2.0', 'score_to' => '2.99', 'level' => 'Low' }
    ]
  end

  it 'scoring_strategy = questions and norm = five_scale' do
    factor = create(:factor, scoring_strategy: :questions)
    factors_norm = create(:factors_norm, norm: five_scale_norm, factor: factor, props: norm_props)
    scoring = { factor.id.to_s => { 'score' => 2.5 } }
    factor_hash = { factor.id => { factor: factor } }
    result = described_class.call!({ factor_id: factor.id, factor_hash: factor_hash, norm: five_scale_norm,
                                     scoring: scoring, factor_norm: factors_norm })

    expect(result).to eq(2)
  end

  it 'scoring_strategy = sub_factors_average and norm = percentile' do
    factor1 = create(:factor, scoring_strategy: :sub_factors_average)
    factor2 = create(:factor, scoring_strategy: :questions)
    factor3 = create(:factor, scoring_strategy: :questions)
    sub_factor_hash = [
      create(:factors_sub_factor, factor: factor1, sub_factor: factor2, weight: 1),
      create(:factors_sub_factor, factor: factor1, sub_factor: factor3, weight: 3)
    ].index_by(&:sub_factor_id)
    factor_hash = {
      factor1.id => { factor: factor1, sub_factor_hash: sub_factor_hash },
      factor2.id => { factor: factor2, sub_factor_hash: {} },
      factor3.id => { factor: factor3, sub_factor_hash: {} }
    }
    scoring = {
      factor1.id.to_s => { 'score' => 1.5, 'zscore' => 0.16667 },
      factor2.id.to_s => { 'score' => 2, 'zscore' => 10.0 },
      factor3.id.to_s => { 'score' => 3.0, 'zscore' => 5.0 }
    }
    result = described_class.call!({ factor_id: factor1.id, factor_hash: factor_hash, norm: percentile_norm,
                                     scoring: scoring, factor_norm: nil })

    expect(result).to eq(Ztable.percentile(((10.0 * 1) + (5 * 3)) / 4))
  end

  it 'scoring_strategy = sub_factors_average and norm = percentile (one zscore is nil)' do
    factor1 = create(:factor, scoring_strategy: :sub_factors_average)
    factor2 = create(:factor, scoring_strategy: :questions)
    factor3 = create(:factor, scoring_strategy: :questions)
    sub_factor_hash = [
      create(:factors_sub_factor, factor: factor1, sub_factor: factor2, weight: 2),
      create(:factors_sub_factor, factor: factor1, sub_factor: factor3, weight: 3)
    ].index_by(&:sub_factor_id)
    factor_hash = {
      factor1.id => { factor: factor1, sub_factor_hash: sub_factor_hash },
      factor2.id => { factor: factor2, sub_factor_hash: {} },
      factor3.id => { factor: factor3, sub_factor_hash: {} }
    }
    scoring = {
      factor1.id.to_s => { 'score' => 1.5, 'zscore' => 0.16667 },
      factor2.id.to_s => { 'score' => 2, 'zscore' => 10.0 },
      factor3.id.to_s => { 'score' => 3.0, 'zscore' => nil }
    }
    result = described_class.call!({ factor_id: factor1.id, factor_hash: factor_hash, norm: percentile_norm,
                                     scoring: scoring, factor_norm: nil })

    expect(result).to eq(nil)
  end
end

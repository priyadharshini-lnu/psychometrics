# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::Scoring::AddZScore do
  let(:five_scale_norm) { create(:norm, with_factors_norm: false, norm_type: :five_scale) }
  let(:five_scale_norm_data) { { 'id' => five_scale_norm.id.to_s, 'type' => 'ETI' } }
  let(:percentile_norm) { create(:norm, with_factors_norm: false, norm_type: :percentile) }
  let(:percentile_norm_data) { { 'id' => percentile_norm.id.to_s, 'type' => 'ETI' } }

  it 'percentile norm' do
    factor1 = create(:factor, scoring_strategy: :questions)
    factor2 = create(:factor, scoring_strategy: :questions)
    factor3 = create(:factor, scoring_strategy: :questions)

    create(:factors_norm, type: :eti, norm: percentile_norm, factor: factor1,
       props: [{ 'mean' => 1, 'standard_deviation' => 3 }])
    create(:factors_norm, type: :eti, norm: percentile_norm, factor: factor2,
       props: [{ 'mean' => 1, 'standard_deviation' => 0.1 }])
    create(:factors_norm, type: :eti, norm: percentile_norm, factor: factor3, props: [{}])

    scoring = {
      factor1.id.to_s => { 'results' => [{ 'value' => [1, 2], 'question_id' => 1 }], 'score' => 1.5 },
      factor2.id.to_s => { 'results' => [{ 'value' => [1, 2], 'question_id' => 1 }], 'score' => 2 },
      factor3.id.to_s => { 'results' => [{ 'value' => [1, 5], 'question_id' => 5 }], 'score' => 3.0 }
    }
    factor_norm_hash = FactorsNorm.
                       where(factor_id: scoring.keys, norm_id: percentile_norm.id, type: :eti).
                       index_by(&:factor_id)

    expect(::UsersResults::Scoring::AddZScore.call!(scoring, percentile_norm_data, factor_norm_hash)).to eq(
      factor1.id.to_s => {
        'results' => [{ 'value' => [1, 2], 'question_id' => 1 }],
        'score' => 1.5,
        'zscore' => 0.16667
      },
      factor2.id.to_s => { 'results' => [{ 'value' => [1, 2], 'question_id' => 1 }], 'score' => 2, 'zscore' => 10.0 },
      factor3.id.to_s => { 'results' => [{ 'value' => [1, 5], 'question_id' => 5 }], 'score' => 3.0, 'zscore' => nil }
    )
  end

  it 'five scale norm' do
    factor1 = create(:factor, scoring_strategy: :questions)
    factor2 = create(:factor, scoring_strategy: :questions)
    factor3 = create(:factor, scoring_strategy: :questions)

    create(:factors_norm, type: :eti, norm: percentile_norm, factor: factor1,
       props: [{ 'mean' => 1, 'standard_deviation' => 3 }])
    create(:factors_norm, type: :eti, norm: percentile_norm, factor: factor2,
       props: [{ 'mean' => 1, 'standard_deviation' => 0.1 }])
    create(:factors_norm, type: :eti, norm: percentile_norm, factor: factor3, props: [{}])

    scoring = {
      factor1.id.to_s => { 'results' => [{ 'value' => [1, 2], 'question_id' => 1 }], 'score' => 1.5 },
      factor2.id.to_s => { 'results' => [{ 'value' => [1, 2], 'question_id' => 1 }], 'score' => 2 },
      factor3.id.to_s => { 'results' => [{ 'value' => [1, 5], 'question_id' => 5 }], 'score' => 3.0 }
    }

    expect(::UsersResults::Scoring::AddZScore.call!(scoring, five_scale_norm_data, {})).to eq(scoring)
  end
end

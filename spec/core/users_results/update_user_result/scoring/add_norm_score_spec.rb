# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::Scoring::AddNormScore do
  let(:five_scale_norm) { create(:norm, with_factors_norm: false, norm_type: :five_scale) }
  let(:percentile_norm) { create(:norm, with_factors_norm: false, norm_type: :percentile) }
  let(:norm_props) do
    [
      { 'score_from' => '1.0', 'score_to' => '1.99', 'level' => 'Very Low' },
      { 'score_from' => '2.0', 'score_to' => '2.99', 'level' => 'Low' },
      { 'score_from' => '3.0', 'score_to' => '3.99', 'level' => 'Average' },
      { 'score_from' => '4.0', 'score_to' => '4.99', 'level' => 'High' },
      { 'score_from' => '5.0', 'score_to' => '5.99', 'level' => 'Very High' }
    ]
  end
  let(:five_scale_norm_data) { { 'id' => five_scale_norm.id.to_s, 'type' => 'ETI' } }
  let(:percentile_norm_data) { { 'id' => percentile_norm.id.to_s, 'type' => 'ETI' } }

  it 'scoring_strategy = questions and norm = five_scale' do
    factor1 = create(:factor, scoring_strategy: :questions)
    factor2 = create(:factor, scoring_strategy: :questions)
    factor3 = create(:factor, scoring_strategy: :questions)
    factor4 = create(:factor, scoring_strategy: :questions)
    factor5 = create(:factor, scoring_strategy: :questions)

    create(:factors_norm, norm: five_scale_norm, factor: factor1, type: :eti, props: norm_props)
    create(:factors_norm, norm: five_scale_norm, factor: factor2, type: :eti, props: norm_props)
    create(:factors_norm, norm: five_scale_norm, factor: factor3, type: :eti, props: norm_props)
    create(:factors_norm, norm: five_scale_norm, factor: factor4, type: :eti, props: norm_props)
    create(:factors_norm, norm: five_scale_norm, factor: factor5, type: :eti, props: norm_props)

    scoring = {
      factor1.id.to_s => { 'results' => [{ 'value' => [1, 2], 'question_id' => 1 }], 'score' => 1.5 },
      factor3.id.to_s => { 'results' => [{ 'value' => [1, 5], 'question_id' => 5 }], 'score' => 3.0 },
      factor4.id.to_s => { 'results' => [{ 'value' => [1, 10.98], 'question_id' => 6 }], 'score' => 5.99 },
      factor5.id.to_s => { 'results' => [], 'score' => nil }
    }

    factor_norm_hash = FactorsNorm.
                       where(factor_id: scoring.keys, norm_id: five_scale_norm.id, type: 'eti').
                       index_by(&:factor_id)

    expect(::UsersResults::Scoring::AddNormScore.call!(scoring, five_scale_norm_data, {}, factor_norm_hash)).to eq(
      factor1.id.to_s => {
        'results' => [{ 'value' => [1, 2], 'question_id' => 1 }], 'score' => 1.5, 'norm_score' => 1
      },
      factor3.id.to_s => {
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }], 'score' => 3.0, 'norm_score' => 3
      },
      factor4.id.to_s => {
        'results' => [{ 'value' => [1, 10.98], 'question_id' => 6 }], 'score' => 5.99, 'norm_score' => 5
      },
      factor5.id.to_s => { 'results' => [], 'score' => nil, 'norm_score' => nil }
    )
  end

  it 'scoring_strategy = questions and norm = five_scale' do
    factor1 = create(:factor, scoring_strategy: :questions)
    factor2 = create(:factor, scoring_strategy: :questions)
    factor3 = create(:factor, scoring_strategy: :questions)
    factor4 = create(:factor, scoring_strategy: :questions)
    factor5 = create(:factor, scoring_strategy: :questions)

    create(:factors_norm, norm: five_scale_norm, factor: factor1, type: :eti, props: norm_props)
    create(:factors_norm, norm: five_scale_norm, factor: factor2, type: :eti, props: norm_props)
    create(:factors_norm, norm: five_scale_norm, factor: factor3, type: :eti, props: norm_props)
    create(:factors_norm, norm: five_scale_norm, factor: factor4, type: :eti, props: norm_props)
    create(:factors_norm, norm: five_scale_norm, factor: factor5, type: :eti, props: norm_props)

    scoring = {
      factor1.id.to_s => { 'results' => [{ 'value' => [1, 2], 'question_id' => 1 }], 'score' => 1.5 },
      factor3.id.to_s => { 'results' => [{ 'value' => [1, 5], 'question_id' => 5 }], 'score' => 3.0 },
      factor4.id.to_s => { 'results' => [{ 'value' => [1, 10.98], 'question_id' => 6 }], 'score' => 5.99 },
      factor5.id.to_s => { 'results' => [], 'score' => nil }
    }

    factor_norm_hash = FactorsNorm.
                       where(factor_id: scoring.keys, norm_id: five_scale_norm.id, type: 'eti').
                       index_by(&:factor_id)

    expect(::UsersResults::Scoring::AddNormScore.call!(scoring, five_scale_norm_data, {}, factor_norm_hash)).to eq(
      factor1.id.to_s => {
        'results' => [{ 'value' => [1, 2], 'question_id' => 1 }], 'score' => 1.5, 'norm_score' => 1
      },
      factor3.id.to_s => {
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }], 'score' => 3.0, 'norm_score' => 3
      },
      factor4.id.to_s => {
        'results' => [{ 'value' => [1, 10.98], 'question_id' => 6 }], 'score' => 5.99, 'norm_score' => 5
      },
      factor5.id.to_s => { 'results' => [], 'score' => nil, 'norm_score' => nil }
    )
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

    expect(::UsersResults::Scoring::AddNormScore.call!(scoring, percentile_norm_data, factor_hash, {})).to eq(
      factor1.id.to_s => { 'score' => 1.5, 'zscore' => 0.16667, 'norm_score' => Ztable.percentile(6.25) },
      factor2.id.to_s => { 'score' => 2, 'zscore' => 10.0, 'norm_score' => Ztable.percentile(10.0) },
      factor3.id.to_s => { 'score' => 3.0, 'zscore' => 5.0, 'norm_score' => Ztable.percentile(5.0) }
    )
  end

  it 'scoring_strategy = sub_factors_average and norm = percentile (one zscore is nil)' do
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
      factor3.id.to_s => { 'score' => 3.0, 'zscore' => nil }
    }

    expect(::UsersResults::Scoring::AddNormScore.call!(scoring, percentile_norm_data, factor_hash, {})).to eq(
      factor1.id.to_s => { 'score' => 1.5, 'zscore' => 0.16667, 'norm_score' => nil },
      factor2.id.to_s => { 'score' => 2, 'zscore' => 10.0, 'norm_score' => Ztable.percentile(10.0) },
      factor3.id.to_s => { 'score' => 3.0, 'zscore' => nil, 'norm_score' => nil }
    )
  end
end

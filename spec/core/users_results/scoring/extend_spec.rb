# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::Scoring::Extend do
  let(:dimension) { create(:dimension) }
  let(:norm) { create(:norm, with_factors_norm: false) }
  let(:norm_props) do
    [
      { 'score_from' => '1.0', 'score_to' => '1.99', 'level' => 'Very Low' },
      { 'score_from' => '2.0', 'score_to' => '2.99', 'level' => 'Low' },
      { 'score_from' => '3.0', 'score_to' => '3.99', 'level' => 'Average' },
      { 'score_from' => '4.0', 'score_to' => '4.99', 'level' => 'High' },
      { 'score_from' => '5.0', 'score_to' => '5.99', 'level' => 'Very High' }
    ]
  end
  let(:norm_data) { { 'id' => norm.id.to_s, 'type' => 'ETI' } }

  it 'add score and norm_score' do
    factor1 = create(:factor, scoring_strategy: :sub_factors_average, dimension: dimension)
    factor2 = create(:factor, scoring_strategy: :questions, dimension: dimension)
    factor3 = create(:factor, scoring_strategy: :questions, dimension: dimension)
    factor4 = create(:factor, scoring_strategy: :questions, dimension: dimension)

    create(:factors_sub_factor, factor: factor1, sub_factor: factor2, weight: 2)
    create(:factors_sub_factor, factor: factor1, sub_factor: factor3, weight: 3)

    create(:factors_norm, norm: norm, factor: factor1, type: :eti, props: norm_props)
    create(:factors_norm, norm: norm, factor: factor2, type: :eti, props: norm_props)
    create(:factors_norm, norm: norm, factor: factor3, type: :eti, props: norm_props)
    create(:factors_norm, norm: norm, factor: factor4, type: :eti, props: norm_props)

    scoring = {
      factor1.id => {
        results: [{ value: [2, 3, 4], question_id: 1 }, { value: 5, question_id: 2 }]
      },
      factor2.id => { results: [{ value: [0, 2], question_id: 3 }] },
      factor3.id => { results: [{ value: [1, 5], question_id: 5 }] },
      factor4.id => { results: [] }
    }
    expect(::UsersResults::Scoring::Extend.call!({
      dimension: dimension,
      scoring: scoring, norm_data: norm_data,
      external_results: {}
    })).to eq(
      factor1.id.to_s => {
        'results' => [{ 'value' => [2, 3, 4], 'question_id' => 1 },
                      { 'value' => 5, 'question_id' => 2 }],
        'score' => 2.2,
        'norm_score' => 2
      },
      factor2.id.to_s => {
        'results' => [{ 'value' => [0, 2],
                        'question_id' => 3 }], 'score' => 1.0,
        'norm_score' => 1
      },
      factor3.id.to_s => {
        'results' => [{ 'value' => [1, 5],
                        'question_id' => 5 }],
        'score' => 3.0, 'norm_score' => 3
      },
      factor4.id.to_s => { 'results' => [], 'score' => nil,
                           'norm_score' => nil }
    )
  end
end

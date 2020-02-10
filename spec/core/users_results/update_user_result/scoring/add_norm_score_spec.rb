# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::Scoring::AddNormScore do
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

  it 'scoring_strategy: :questions' do
    factor1 = create(:factor, scoring_strategy: :questions)
    factor2 = create(:factor, scoring_strategy: :questions)
    factor3 = create(:factor, scoring_strategy: :questions)
    factor4 = create(:factor, scoring_strategy: :questions)
    factor5 = create(:factor, scoring_strategy: :questions)

    create(:factors_norm, norm: norm, factor: factor1, type: :eti, props: norm_props)
    create(:factors_norm, norm: norm, factor: factor2, type: :eti, props: norm_props)
    create(:factors_norm, norm: norm, factor: factor3, type: :eti, props: norm_props)
    create(:factors_norm, norm: norm, factor: factor4, type: :eti, props: norm_props)
    create(:factors_norm, norm: norm, factor: factor5, type: :eti, props: norm_props)

    scoring = {
      factor1.id.to_s => { 'results' => [{ 'value' => [1, 2], 'question_id' => 1 }], 'score' => 1.5 },
      factor3.id.to_s => { 'results' => [{ 'value' => [1, 5], 'question_id' => 5 }], 'score' => 3.0 },
      factor4.id.to_s => { 'results' => [{ 'value' => [1, 10.98], 'question_id' => 6 }], 'score' => 5.99 },
      factor5.id.to_s => { 'results' => [], 'score' => nil }
    }

    expect(::UsersResults::Scoring::AddNormScore.call!(scoring, norm_data)).to eq(
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
end

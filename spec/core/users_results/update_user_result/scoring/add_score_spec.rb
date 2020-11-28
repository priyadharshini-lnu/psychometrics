# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::Scoring::AddScore do
  it 'scoring_strategy: :questions' do
    factor1 = create(:factor, scoring_strategy: :questions)
    factor2 = create(:factor, scoring_strategy: :questions)

    factor_hash = {
      factor1.id => { factor: factor1, sub_factor_hash: {} },
      factor2.id => { factor: factor2, sub_factor_hash: {} }
    }

    factor_ids = factor_hash.keys

    scoring = {
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 },
          { 'value' => 2, 'question_id' => 3 }
        ]
      },
      factor2.id.to_s => { 'results' => [] }
    }

    expect(::UsersResults::Scoring::AddScore.call!(factor_hash, factor_ids, scoring)).to eq(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 },
          { 'value' => 2, 'question_id' => 3 }
        ],
        'score' => 3.33 # (((2 + 3 + 4) / 3) + 5 + 2) / 3.0 = 3.33
      },
      factor2.id.to_s => { 'results' => [], 'score' => nil }
    )
  end

  it 'scoring_strategy: :questions_sum' do
    factor1 = create(:factor, scoring_strategy: :questions_sum)
    factor2 = create(:factor, scoring_strategy: :questions_sum)

    factor_hash = {
      factor1.id => { factor: factor1, sub_factor_hash: {} },
      factor2.id => { factor: factor2, sub_factor_hash: {} }
    }

    factor_ids = factor_hash.keys

    scoring = {
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 },
          { 'value' => 2, 'question_id' => 3 }
        ]
      },
      factor2.id.to_s => { 'results' => [] }
    }

    expect(::UsersResults::Scoring::AddScore.call!(factor_hash, factor_ids, scoring)).to eq(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 },
          { 'value' => 2, 'question_id' => 3 }
        ],
        'score' => 10 # (((2 + 3 + 4) / 3) + 5 + 2)
      },
      factor2.id.to_s => { 'results' => [], 'score' => nil }
    )
  end

  it 'scoring_strategy: :sub_factor_questions' do
    factor1 = create(:factor, scoring_strategy: :sub_factor_questions)
    factor2 = create(:factor, scoring_strategy: :sub_factor_questions)
    factor3 = create(:factor, scoring_strategy: :questions)
    factor4 = create(:factor, scoring_strategy: :questions)
    factor5 = create(:factor, scoring_strategy: :questions)
    factor6 = create(:factor, scoring_strategy: :questions)

    sub_factor_hash1 = [
      create(:factors_sub_factor, factor: factor1, sub_factor: factor2),
      create(:factors_sub_factor, factor: factor1, sub_factor: factor3),
      create(:factors_sub_factor, factor: factor1, sub_factor: factor5),
      create(:factors_sub_factor, factor: factor1, sub_factor: factor6)
    ].index_by(&:sub_factor_id)

    sub_factor_hash2 = [
      create(:factors_sub_factor, factor: factor2, sub_factor: factor3),
      create(:factors_sub_factor, factor: factor2, sub_factor: factor4)
    ].index_by(&:sub_factor_id)

    sub_factor_hash3 = [
      create(:factors_sub_factor, factor: factor3, sub_factor: factor4)
    ].index_by(&:sub_factor_id)

    factor_hash = {
      factor1.id => { factor: factor1, sub_factor_hash: sub_factor_hash1 },
      factor2.id => { factor: factor2, sub_factor_hash: sub_factor_hash2 },
      factor3.id => { factor: factor3, sub_factor_hash: sub_factor_hash3 },
      factor4.id => { factor: factor4, sub_factor_hash: {} },
      factor5.id => { factor: factor5, sub_factor_hash: {} },
      factor6.id => { factor: factor6, sub_factor_hash: {} }
    }

    factor_ids = factor_hash.keys

    scoring = {
      factor1.id.to_s => {
        'results' => [{ 'value' => [2, 3, 4], 'question_id' => 1 }, { 'value' => 5, 'question_id' => 2 }]
      },
      factor2.id.to_s => { 'results' => [{ 'value' => [0, 2], 'question_id' => 3 }] },
      factor3.id.to_s => {
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }, { 'value' => 7, 'question_id' => 8 }]
      },
      factor4.id.to_s => { 'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }] },
      factor5.id.to_s => { 'results' => [] },
      factor6.id.to_s => { 'results' => [{ 'value' => [1, 1, 3], 'question_id' => 7 }] }
    }
    expect(::UsersResults::Scoring::AddScore.call!(factor_hash, factor_ids, scoring)).to eq(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 }
        ],
        'score' => 3.89 # ((1 + 5)/2.0 + 7 + (1 + 1 + 3)/3.0) / 3.0 = 3.89
      },
      factor2.id.to_s => {
        'results' => [{ 'value' => [0, 2], 'question_id' => 3 }],
        'score' => 4.11 # ((1 + 5)/2.0 + 7 + (2 + 2 + 3)/3.0) / 3.0 = 4.11
      },
      factor3.id.to_s => {
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }, { 'value' => 7, 'question_id' => 8 }],
        'score' => 5.0 # ((1 + 5)/2.0 + 7) / 2.0 = 5.0
      },
      factor4.id.to_s => {
        'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }], 'score' => 2.33 # (2 + 2 + 3) / 3.0 = 2.33
      },
      factor5.id.to_s => { 'results' => [], 'score' => nil },
      factor6.id.to_s => {
        'results' => [{ 'value' => [1, 1, 3], 'question_id' => 7 }], 'score' => 1.67 # (1 + 1 + 3) / 3.0 = 1.67
      }
    )
  end

  it 'scoring_strategy: :sub_factor_questions_sum' do
    factor1 = create(:factor, scoring_strategy: :sub_factor_questions_sum)
    factor2 = create(:factor, scoring_strategy: :sub_factor_questions_sum)
    factor3 = create(:factor, scoring_strategy: :questions)
    factor4 = create(:factor, scoring_strategy: :questions)
    factor5 = create(:factor, scoring_strategy: :questions)
    factor6 = create(:factor, scoring_strategy: :questions)

    sub_factor_hash1 = [
      create(:factors_sub_factor, factor: factor1, sub_factor: factor2),
      create(:factors_sub_factor, factor: factor1, sub_factor: factor3),
      create(:factors_sub_factor, factor: factor1, sub_factor: factor5),
      create(:factors_sub_factor, factor: factor1, sub_factor: factor6)
    ].index_by(&:sub_factor_id)

    sub_factor_hash2 = [
      create(:factors_sub_factor, factor: factor2, sub_factor: factor3),
      create(:factors_sub_factor, factor: factor2, sub_factor: factor4)
    ].index_by(&:sub_factor_id)

    sub_factor_hash3 = [
      create(:factors_sub_factor, factor: factor3, sub_factor: factor4)
    ].index_by(&:sub_factor_id)

    factor_hash = {
      factor1.id => { factor: factor1, sub_factor_hash: sub_factor_hash1 },
      factor2.id => { factor: factor2, sub_factor_hash: sub_factor_hash2 },
      factor3.id => { factor: factor3, sub_factor_hash: sub_factor_hash3 },
      factor4.id => { factor: factor4, sub_factor_hash: {} },
      factor5.id => { factor: factor5, sub_factor_hash: {} },
      factor6.id => { factor: factor6, sub_factor_hash: {} }
    }

    factor_ids = factor_hash.keys

    scoring = {
      factor1.id.to_s => {
        'results' => [{ 'value' => [2, 3, 4], 'question_id' => 1 }, { 'value' => 5, 'question_id' => 2 }]
      },
      factor2.id.to_s => { 'results' => [{ 'value' => [0, 2], 'question_id' => 3 }] },
      factor3.id.to_s => {
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }, { 'value' => 7, 'question_id' => 8 }]
      },
      factor4.id.to_s => { 'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }] },
      factor5.id.to_s => { 'results' => [] },
      factor6.id.to_s => { 'results' => [{ 'value' => [1, 1, 3], 'question_id' => 7 }] }
    }
    expect(::UsersResults::Scoring::AddScore.call!(factor_hash, factor_ids, scoring)).to eq(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 }
        ],
        'score' => (1 + 5) / 2.0 + 7 + (1 + 1 + 3) / 3.0
      },
      factor2.id.to_s => {
        'results' => [{ 'value' => [0, 2], 'question_id' => 3 }],
        'score' => (1 + 5) / 2.0 + 7 + (2 + 2 + 3) / 3.0
      },
      factor3.id.to_s => {
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }, { 'value' => 7, 'question_id' => 8 }],
        'score' => 5.0 # ((1 + 5)/2.0 + 7) / 2.0 = 5.0
      },
      factor4.id.to_s => {
        'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }], 'score' => 2.33 # (2 + 2 + 3) / 3.0 = 2.33
      },
      factor5.id.to_s => { 'results' => [], 'score' => nil },
      factor6.id.to_s => {
        'results' => [{ 'value' => [1, 1, 3], 'question_id' => 7 }], 'score' => 1.67 # (1 + 1 + 3) / 3.0 = 1.67
      }
    )
  end

  it 'scoring_strategy: :sub_factors_average' do
    factor1 = create(:factor, scoring_strategy: :sub_factors_average)
    factor2 = create(:factor, scoring_strategy: :questions)
    factor3 = create(:factor, scoring_strategy: :questions)
    factor4 = create(:factor, scoring_strategy: :questions)
    factor5 = create(:factor, scoring_strategy: :questions)

    sub_factor_hash = [
      create(:factors_sub_factor, factor: factor1, sub_factor: factor2, weight: 1),
      create(:factors_sub_factor, factor: factor1, sub_factor: factor3, weight: 3),
      create(:factors_sub_factor, factor: factor1, sub_factor: factor4, weight: 4),
      create(:factors_sub_factor, factor: factor1, sub_factor: factor5, weight: 2)
    ].index_by(&:sub_factor_id)

    factor_hash = {
      factor1.id => { factor: factor1, sub_factor_hash: sub_factor_hash },
      factor2.id => { factor: factor2, sub_factor_hash: {} },
      factor3.id => { factor: factor3, sub_factor_hash: {} },
      factor4.id => { factor: factor4, sub_factor_hash: {} },
      factor5.id => { factor: factor5, sub_factor_hash: {} }
    }

    factor_ids = factor_hash.keys

    scoring = {
      factor1.id.to_s => {
        'results' => [{ 'value' => [2, 3, 4], 'question_id' => 1 }, { 'value' => 5, 'question_id' => 2 }]
      },
      factor2.id.to_s => { 'results' => [{ 'value' => [0, 2], 'question_id' => 3 }] },
      factor3.id.to_s => { 'results' => [{ 'value' => [1, 5], 'question_id' => 5 }] },
      factor4.id.to_s => { 'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }] },
      factor5.id.to_s => { 'results' => [] }
    }

    expect(::UsersResults::Scoring::AddScore.call!(factor_hash, factor_ids, scoring)).to eq(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 }
        ],
        'score' => 2.42 # (1.0 * 1 + 3.0 * 3 + 2.33 * 4) / (1 + 3 + 4) = 2.42
      },
      factor2.id.to_s => {
        'results' => [{ 'value' => [0, 2], 'question_id' => 3 }], 'score' => 1.0 # (0 + 2) / 2.0 = 1.0
      },
      factor3.id.to_s => {
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }], 'score' => 3.0 # (1 + 5) / 2.0 = 3.0
      },
      factor4.id.to_s => {
        'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }], 'score' => 2.33 # (2 + 2 + 3) / 3.0 = 2.33
      },
      factor5.id.to_s => { 'results' => [], 'score' => nil }
    )
  end

  it 'scoring_strategy: :sub_factors_conditional_average' do
    factor1 = create(:factor, scoring_strategy: :sub_factors_conditional_average)
    factor2 = create(:factor, scoring_strategy: :questions)
    factor3 = create(:factor, scoring_strategy: :questions)
    factor4 = create(:factor, scoring_strategy: :questions)

    sub_factor_hash = [
      create(:factors_sub_factor, factor: factor1, sub_factor: factor2, weight: 1, predicate: '==', value: 1.0),
      create(:factors_sub_factor, factor: factor1, sub_factor: factor3, weight: 2, predicate: '<', value: 3),
      create(:factors_sub_factor, factor: factor1, sub_factor: factor4, weight: 4, predicate: '>=', value: 2.33)
    ].index_by(&:sub_factor_id)

    factor_hash = {
      factor1.id => { factor: factor1, sub_factor_hash: sub_factor_hash },
      factor2.id => { factor: factor2, sub_factor_hash: {} },
      factor3.id => { factor: factor3, sub_factor_hash: {} },
      factor4.id => { factor: factor4, sub_factor_hash: {} }
    }

    factor_ids = factor_hash.keys

    scoring = {
      factor1.id.to_s => {
        'results' => [{ 'value' => [2, 3, 4], 'question_id' => 1 }, { 'value' => 5, 'question_id' => 2 }]
      },
      factor2.id.to_s => { 'results' => [{ 'value' => [0, 2], 'question_id' => 3 }] },
      factor3.id.to_s => { 'results' => [{ 'value' => [1, 5], 'question_id' => 5 }] },
      factor4.id.to_s => { 'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }] }
    }

    expect(::UsersResults::Scoring::AddScore.call!(factor_hash, factor_ids, scoring)).to eq(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 }
        ],
        'score' => 71.43 # (1 + 4) * 100 / (1 + 2 + 4) = 71.43
      },
      factor2.id.to_s => {
        'results' => [{ 'value' => [0, 2], 'question_id' => 3 }], 'score' => 1.0 # (0 + 2) / 2.0 = 1.0
      },
      factor3.id.to_s => {
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }], 'score' => 3.0 # (1 + 5) / 2.0 = 3.0
      },
      factor4.id.to_s => {
        'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }], 'score' => 2.33 # (2 + 2 + 3) / 3.0 = 2.33
      }
    )
  end
end

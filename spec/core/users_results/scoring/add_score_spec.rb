# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::Scoring::AddScore do
  let(:five_scale_norm) { create(:norm, with_factors_norm: false, norm_type: :five_scale) }
  let(:percentile_norm) { create(:norm, with_factors_norm: false, norm_type: :percentile) }

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
    result = described_class.call!(factor_hash, factor_ids, scoring, five_scale_norm, {}, {})

    expect(result).to eq(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 },
          { 'value' => 2, 'question_id' => 3 }
        ],
        'score' => 3.33, # (((2 + 3 + 4) / 3) + 5 + 2) / 3.0 = 3.33,
        'norm_score' => nil
      },
      factor2.id.to_s => { 'results' => [], 'score' => nil, 'norm_score' => nil }
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
    result = described_class.call!(factor_hash, factor_ids, scoring, five_scale_norm, {}, {})

    expect(result).to eq(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 },
          { 'value' => 2, 'question_id' => 3 }
        ],
        'score' => ((2 + 3 + 4) / 3) + 5 + 2,
        'norm_score' => nil
      },
      factor2.id.to_s => { 'results' => [], 'score' => nil, 'norm_score' => nil }
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
    result = described_class.call!(factor_hash, factor_ids, scoring, five_scale_norm, {}, {})

    expect(result).to eq(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 }
        ],
        'score' => 3.89, # ((1 + 5)/2.0 + 7 + (1 + 1 + 3)/3.0) / 3.0 = 3.89
        'norm_score' => nil
      },
      factor2.id.to_s => {
        'results' => [{ 'value' => [0, 2], 'question_id' => 3 }],
        'score' => 4.11, # ((1 + 5)/2.0 + 7 + (2 + 2 + 3)/3.0) / 3.0 = 4.11
        'norm_score' => nil
      },
      factor3.id.to_s => {
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }, { 'value' => 7, 'question_id' => 8 }],
        'score' => 5.0, # ((1 + 5)/2.0 + 7) / 2.0 = 5.0
        'norm_score' => nil
      },
      factor4.id.to_s => {
        'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }],
        'score' => 2.33, # (2 + 2 + 3) / 3.0 = 2.33
        'norm_score' => nil
      },
      factor5.id.to_s => { 'results' => [], 'score' => nil, 'norm_score' => nil },
      factor6.id.to_s => {
        'results' => [{ 'value' => [1, 1, 3], 'question_id' => 7 }],
        'score' => 1.67, # (1 + 1 + 3) / 3.0 = 1.67
        'norm_score' => nil
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
    result = described_class.call!(factor_hash, factor_ids, scoring, five_scale_norm, {}, {})

    expect(result).to eq(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 }
        ],
        'score' => ((1 + 5) / 2.0) + 7 + ((1 + 1 + 3) / 3.0),
        'norm_score' => nil
      },
      factor2.id.to_s => {
        'results' => [{ 'value' => [0, 2], 'question_id' => 3 }],
        'score' => ((1 + 5) / 2.0) + 7 + ((2 + 2 + 3) / 3.0),
        'norm_score' => nil
      },
      factor3.id.to_s => {
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }, { 'value' => 7, 'question_id' => 8 }],
        'score' => ((((1 + 5) / 2.0) + 7) / 2.0).round(2),
        'norm_score' => nil
      },
      factor4.id.to_s => {
        'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }], 'score' => ((2 + 2 + 3) / 3.0).round(2),
        'norm_score' => nil
      },
      factor5.id.to_s => { 'results' => [], 'score' => nil, 'norm_score' => nil },
      factor6.id.to_s => {
        'results' => [{ 'value' => [1, 1, 3], 'question_id' => 7 }], 'score' => ((1 + 1 + 3) / 3.0).round(2),
        'norm_score' => nil
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
    result = described_class.call!(factor_hash, factor_ids, scoring, five_scale_norm, {}, {})

    expect(result).to eq(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 }
        ],
        'score' => 2.42, # (1.0 * 1 + 3.0 * 3 + 2.33 * 4) / (1 + 3 + 4) = 2.42
        'norm_score' => nil
      },
      factor2.id.to_s => {
        'results' => [{ 'value' => [0, 2], 'question_id' => 3 }], 'score' => 1.0, # (0 + 2) / 2.0 = 1.0
        'norm_score' => nil
      },
      factor3.id.to_s => {
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }], 'score' => 3.0, # (1 + 5) / 2.0 = 3.0
        'norm_score' => nil
      },
      factor4.id.to_s => {
        'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }], 'score' => 2.33, # (2 + 2 + 3) / 3.0 = 2.33
        'norm_score' => nil
      },
      factor5.id.to_s => { 'results' => [], 'score' => nil, 'norm_score' => nil }
    )
  end

  it 'scoring_strategy: :sub_factors_average with use_sub_factor_norm_score enabled' do
    factor1 = create(:factor, scoring_strategy: :sub_factors_average, use_sub_factor_norm_score: true)
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
    factor_ids = factor_hash.keys

    scoring = {
      factor1.id.to_s => {
        'results' => [{ 'value' => [2, 3, 4], 'question_id' => 1 }, { 'value' => 5, 'question_id' => 2 }]
      },
      factor2.id.to_s => { 'results' => [{ 'value' => [0, 2], 'question_id' => 3 }] },
      factor3.id.to_s => { 'results' => [{ 'value' => [1, 5], 'question_id' => 5 }] }
    }
    norm_props = [
      { 'score_from' => '1.0', 'score_to' => '1.99', 'level' => 'Very Low' },
      { 'score_from' => '2.0', 'score_to' => '4.0', 'level' => 'Low' }
    ]
    factor_norm_hash = {
      factor1.id => create(:factors_norm, factor: factor2, props: norm_props),
      factor2.id => create(:factors_norm, factor: factor2, props: norm_props),
      factor3.id => create(:factors_norm, factor: factor2, props: norm_props)
    }
    result = described_class.call!(factor_hash, factor_ids, scoring, five_scale_norm, factor_norm_hash, {})

    expect(result).to eq(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 }
        ],
        'score' => 1.75, # (1.0 * 1 + 2.0 * 3) / (1 + 3) = 1.75
        'norm_score' => 1
      },
      factor2.id.to_s => {
        'results' => [{ 'value' => [0, 2], 'question_id' => 3 }], 'score' => 1.0, # (0 + 2) / 2.0 = 1.0
        'norm_score' => 1
      },
      factor3.id.to_s => {
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }], 'score' => 3.0, # (1 + 5) / 2.0 = 3.0
        'norm_score' => 2
      }
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
    result = described_class.call!(factor_hash, factor_ids, scoring, five_scale_norm, {}, {})

    expect(result).to eq(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 }
        ],
        'score' => 71.43, # (1 + 4) * 100 / (1 + 2 + 4) = 71.43
        'norm_score' => nil
      },
      factor2.id.to_s => {
        'results' => [{ 'value' => [0, 2], 'question_id' => 3 }],
        'score' => 1.0, # (0 + 2) / 2.0 = 1.0
        'norm_score' => nil
      },
      factor3.id.to_s => {
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }],
        'score' => 3.0, # (1 + 5) / 2.0 = 3.0
        'norm_score' => nil
      },
      factor4.id.to_s => {
        'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }],
        'score' => 2.33, # (2 + 2 + 3) / 3.0 = 2.33
        'norm_score' => nil
      }
    )
  end

  it 'calculates norm_score for five_scale_norm' do
    factor = create(:factor, scoring_strategy: :questions)
    factors_norm = create(:factors_norm, factor: factor,
      props: [
        { 'score_from' => '1.0', 'score_to' => '1.99', 'level' => 'Very Low' },
        { 'score_from' => '2.0', 'score_to' => '4.0', 'level' => 'Low' }
      ])

    factor_hash = { factor.id => { factor: factor, sub_factor_hash: {} } }
    scoring = {
      factor.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 },
          { 'value' => 2, 'question_id' => 3 }
        ]
      }
    }
    result = described_class.call!(
      factor_hash, [factor.id], scoring, five_scale_norm, { factor.id => factors_norm }, {}
    )

    expect(result).to eq(
      factor.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 },
          { 'value' => 2, 'question_id' => 3 }
        ],
        'score' => 3.33, # (((2 + 3 + 4) / 3) + 5 + 2) / 3.0 = 3.33,
        'norm_score' => 2
      }
    )
  end

  it 'calculates zscore and norm_score for percentile_scale_norm' do
    factor = create(:factor, scoring_strategy: :questions)
    factors_norm = create(:factors_norm, factor: factor,
      props: [{ 'mean' => 1, 'standard_deviation' => 3 }])
    factor_hash = { factor.id => { factor: factor, sub_factor_hash: {} } }
    scoring = {
      factor.id.to_s => {
        'results' => [
          { 'value' => 2, 'question_id' => 2 },
          { 'value' => 1, 'question_id' => 3 }
        ]
      }
    }
    result = described_class.call!(
      factor_hash, [factor.id], scoring, percentile_norm, { factor.id => factors_norm }, {}
    )

    expect(result).to eq(
      factor.id.to_s => {
        'results' => [
          { 'value' => 2, 'question_id' => 2 },
          { 'value' => 1, 'question_id' => 3 }
        ],
        'score' => (2 + 1) / 2.0,
        'zscore' => 0.16667,
        'norm_score' => Ztable.percentile(0.16667)
      }
    )
  end

  it 'scoring_strategy: :external_score' do
    external_results = JSON.parse(File.read('spec/core/users_results/scoring/external_results/hogan.json'))
    external_scoring1 = [
      {
        'type' => 'percentage',
        'jsonpath' => "scores.percentileScores.scaleScores[?(@.scaleName =='Quantitative_Scale')].scaleScore"
      },
      {
        'type' => 'zscore',
        'jsonpath' => "scores.percentileScores.scaleScores[?(@.scaleName =='Overall_Test_Score')].scaleScore"
      }
    ]

    external_scoring2 = [
      {
        'type' => 'score',
        'jsonpath' => "scores.rawScores.scaleScores[?(@.scaleName =='Overall_Test_Score')].scaleScore"
      },
      {
        'type' => 'norm_score',
        'jsonpath' => "scores.rawScores.fakeScaleScores[?(@.scaleName =='Overall_Test_Score')].scaleScore"
      }
    ]
    factor1 = create(:factor, scoring_strategy: :external_score, external_scoring: external_scoring1)
    factor2 = create(:factor, scoring_strategy: :external_score, external_scoring: external_scoring2)

    factor_hash = {
      factor1.id => { factor: factor1, sub_factor_hash: {} },
      factor2.id => { factor: factor2, sub_factor_hash: {} }
    }

    factor_ids = factor_hash.keys

    result = described_class.call!(factor_hash, factor_ids, {}, five_scale_norm, {}, external_results)

    expect(result).to eq(
      factor1.id.to_s => { 'percentage' => '1', 'zscore' => '4' },
      factor2.id.to_s => { 'score' => '5', 'norm_score' => nil }
    )
  end

  it 'scoring_strategy: :questions_percentage' do
    factor1 = create(:factor, scoring_strategy: :questions_percentage, scale_min: 1, scale_max: 5)
    factor2 = create(:factor, scoring_strategy: :questions_percentage, scale_min: 1, scale_max: 5)

    factor_hash = {
      factor1.id => { factor: factor1, sub_factor_hash: {} },
      factor2.id => { factor: factor2, sub_factor_hash: {} }
    }

    factor_ids = factor_hash.keys

    scoring = {
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1, 'max_value' => 15, 'value_sum' => 9 },
          { 'value' => 5, 'question_id' => 2, 'max_value' => 5, 'value_sum' => 5 },
          { 'value' => 2, 'question_id' => 3, 'max_value' => 5, 'value_sum' => 2 }
        ]
      },
      factor2.id.to_s => { 'results' => [] }
    }
    result = described_class.call!(
      factor_hash, factor_ids, scoring, five_scale_norm, {}, {}, {
        factor1.id => 3,
        factor2.id => 0
      }
    )

    expect(result).to eq(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1, 'max_value' => 15, 'value_sum' => 9 },
          { 'value' => 5, 'question_id' => 2, 'max_value' => 5, 'value_sum' => 5 },
          { 'value' => 2, 'question_id' => 3, 'max_value' => 5, 'value_sum' => 2 }
        ],
        'score' => Utility::Number.scale((9 + 5 + 2) / (15 + 5 + 5).to_f, 0, 1, 1, 5).round(2),
        'norm_score' => nil
      },
      factor2.id.to_s => { 'results' => [], 'score' => nil, 'norm_score' => nil }
    )
  end

  it 'scoring_strategy: :sub_factors_sum' do
    factor1 = create(:factor, scoring_strategy: :sub_factors_sum)
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
    result = described_class.call!(factor_hash, factor_ids, scoring, five_scale_norm, {}, {})

    expect(result).to eq(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 }
        ],
        'score' => 19.32, # (1.0 * 1 + 3.0 * 3 + 2.33 * 4) = 19.32
        'norm_score' => nil
      },
      factor2.id.to_s => {
        'results' => [{ 'value' => [0, 2], 'question_id' => 3 }], 'score' => 1.0, # (0 + 2) / 2.0 = 1.0
        'norm_score' => nil
      },
      factor3.id.to_s => {
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }], 'score' => 3.0, # (1 + 5) / 2.0 = 3.0
        'norm_score' => nil
      },
      factor4.id.to_s => {
        'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }], 'score' => 2.33, # (2 + 2 + 3) / 3.0 = 2.33
        'norm_score' => nil
      },
      factor5.id.to_s => { 'results' => [], 'score' => nil, 'norm_score' => nil }
    )
  end
end

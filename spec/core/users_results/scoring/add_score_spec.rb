# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::Scoring::AddScore do
  let(:five_scale_norm) { create(:norm, with_factors_norm: false, norm_type: :five_scale) }
  let(:percentile_norm) { create(:norm, with_factors_norm: false, norm_type: :percentile) }

  context 'with rounding' do
    it 'scoring_strategy: :questions' do
      factor1 = create(:factor, scoring_strategy: :questions, precision: 1)
      factor2 = create(:factor, scoring_strategy: :questions)
      factor3 = create(:factor, scoring_strategy: :questions, precision: 3)

      factor_hash = {
        factor1.id => { factor: factor1, sub_factor_hash: {} },
        factor2.id => { factor: factor2, sub_factor_hash: {} },
        factor3.id => { factor: factor3, sub_factor_hash: {} }
      }
      results = {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 },
          { 'value' => 2, 'question_id' => 3 }
        ]
      }
      factor_ids = factor_hash.keys

      scoring = {
        factor1.id.to_s => results,
        factor2.id.to_s => results,
        factor3.id.to_s => results
      }
      unrounded_score = (((2 + 3 + 4) / 3) + 5 + 2) / 3.0
      result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                       norm: five_scale_norm })

      expect(result[factor1.id.to_s]['score']).to_not eq(unrounded_score)
      expect(result[factor1.id.to_s]['score']).to eq(unrounded_score.round(1))
      expect(result[factor2.id.to_s]['score']).to_not eq(unrounded_score)
      expect(result[factor2.id.to_s]['score']).to eq(unrounded_score.round(2))
      expect(result[factor3.id.to_s]['score']).to_not eq(unrounded_score)
      expect(result[factor3.id.to_s]['score']).to eq(unrounded_score.round(3))
    end

    it 'scoring_strategy: :questions_sum' do
      factor1 = create(:factor, scoring_strategy: :questions_sum, precision: 2)

      factor_hash = {
        factor1.id => { factor: factor1, sub_factor_hash: {} }
      }

      factor_ids = factor_hash.keys

      scoring = {
        factor1.id.to_s => {
          'results' => [
            { 'value' => [2, 3, 3], 'question_id' => 1 },
            { 'value' => 5, 'question_id' => 2 },
            { 'value' => 2, 'question_id' => 3 }
          ]
        }
      }
      result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                       norm: five_scale_norm })

      unrounded_score = (((2 + 3 + 3) / 3.0) + 5 + 2)
      expect(result[factor1.id.to_s]['score']).to_not eq(unrounded_score)
      expect(result[factor1.id.to_s]['score']).to eq(unrounded_score.round(2))
    end

    it 'scoring_strategy :formula with std libs math, string, table' do
      formula_with_table = %(
        local t = {"b", "a", "c"}
        table.sort(t)
        if table.concat(t) == "abc" then return 1 else return 0 end
      )
      factor1 = create(
        :factor, scoring_strategy: :custom_formula, custom_formula: formula_with_table,
        precision: 3
      )
      factor2 = create(
        :factor, scoring_strategy: :custom_formula,
        custom_formula: 'if string.upper("abc") == "ABC" then return 1 else return 0 end',
        precision: 3
      )
      factor3 = create(
        :factor, scoring_strategy: :custom_formula, custom_formula: 'return math.deg(math.pi)',
        precision: 3
      )
      # scoring = {
      #   factor1.id.to_s => { 'score' => 3 },
      #   factor2.id.to_s => { 'score' => 3 }
      # }
      factor_hash = {
        factor1.id => { factor: factor1, sub_factor_hash: {} },
        factor2.id => { factor: factor2, sub_factor_hash: {} },
        factor3.id => { factor: factor3, sub_factor_hash: {} }
      }
      factor_ids = factor_hash.keys
      result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids,
                                       norm: five_scale_norm })
      expect(result[factor1.id.to_s]['score']).to eq(1)
      expect(result[factor2.id.to_s]['score']).to eq(1)
      expect(result[factor3.id.to_s]['score']).to eq(180)
    end

    it 'scoring_strategy :formula' do
      factor1 = create(:factor)
      factor2 = create(
        :factor, scoring_strategy: :custom_formula, custom_formula: "return assessment.raw_score(#{factor1.id})",
        precision: 3
      )
      scoring = {
        factor1.id.to_s => { 'score' => 3.4569 }
      }
      factor_hash = {
        factor2.id => { factor: factor2, sub_factor_hash: {} }
      }
      factor_ids = factor_hash.keys
      result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                       norm: five_scale_norm })

      unrounded_score = 3.4569
      expect(result[factor2.id.to_s]['score']).to_not eq(unrounded_score)
      expect(result[factor2.id.to_s]['score']).to eq(unrounded_score.round(3))
    end

    it 'scoring_strategy :sub_factors_average' do
      factor1 = create(:factor, scoring_strategy: :sub_factors_average, precision: 1)
      factor2 = create(:factor, scoring_strategy: :questions)
      factor3 = create(:factor, scoring_strategy: :questions)
      factor4 = create(:factor, scoring_strategy: :sub_factors_average)

      factor1_sub_factor_hash = [
        create(:factors_sub_factor, factor: factor1, sub_factor: factor2, weight: 1),
        create(:factors_sub_factor, factor: factor1, sub_factor: factor3, weight: 3)
      ].index_by(&:sub_factor_id)
      factor4_sub_factor_hash = [
        create(:factors_sub_factor, factor: factor4, sub_factor: factor2, weight: 1),
        create(:factors_sub_factor, factor: factor4, sub_factor: factor3, weight: 3)
      ].index_by(&:sub_factor_id)

      factor_hash = {
        factor1.id => { factor: factor1, sub_factor_hash: factor1_sub_factor_hash },
        factor2.id => { factor: factor2, sub_factor_hash: {} },
        factor3.id => { factor: factor3, sub_factor_hash: {} },
        factor4.id => { factor: factor4, sub_factor_hash: factor4_sub_factor_hash }
      }

      factor_ids = factor_hash.keys

      scoring = {
        factor2.id.to_s => { 'results' => [{ 'value' => [1, 2, 5], 'question_id' => 3 }] },
        factor3.id.to_s => { 'results' => [{ 'value' => [1, 4, 2], 'question_id' => 5 }] }
      }
      result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                       norm: five_scale_norm })

      unrounded_score = (((8 / 3.0).round(2) * 1) + ((7 / 3.0).round(2) * 3)) / (1 + 3)
      expect(result[factor1.id.to_s]['score']).to_not eq(unrounded_score)
      expect(result[factor1.id.to_s]['score']).to eq(unrounded_score.round(1))
      expect(result[factor4.id.to_s]['score']).to_not eq(unrounded_score)
      expect(result[factor4.id.to_s]['score']).to eq(unrounded_score.round(2))
    end

    it 'scoring_strategy :sub_factor_questions' do
      factor1 = create(:factor, scoring_strategy: :sub_factor_questions, precision: 3)
      factor2 = create(:factor, scoring_strategy: :questions)
      factor3 = create(:factor, scoring_strategy: :questions)
      factor4 = create(:factor, scoring_strategy: :sub_factor_questions)
      factor1_sub_factor_hash = [
        create(:factors_sub_factor, factor: factor1, sub_factor: factor2),
        create(:factors_sub_factor, factor: factor1, sub_factor: factor3)
      ].index_by(&:sub_factor_id)
      factor4_sub_factor_hash = [
        create(:factors_sub_factor, factor: factor4, sub_factor: factor2),
        create(:factors_sub_factor, factor: factor4, sub_factor: factor3)
      ].index_by(&:sub_factor_id)
      factor_hash = {
        factor1.id => { factor: factor1, sub_factor_hash: factor1_sub_factor_hash },
        factor2.id => { factor: factor2, sub_factor_hash: {} },
        factor3.id => { factor: factor3, sub_factor_hash: {} },
        factor4.id => { factor: factor4, sub_factor_hash: factor4_sub_factor_hash }
      }
      factor_ids = factor_hash.keys
      scoring = {
        factor1.id.to_s => {
          'results' => [{ 'value' => [2, 3, 4], 'question_id' => 1 }, { 'value' => 5, 'question_id' => 2 }]
        },
        factor2.id.to_s => { 'results' => [{ 'value' => [1, 2], 'question_id' => 3 }] },
        factor3.id.to_s => {
          'results' => [{ 'value' => [1, 5], 'question_id' => 5 }, { 'value' => 7, 'question_id' => 8 }]
        }
      }
      result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                       norm: five_scale_norm })

      unrounded_score = (((1 + 2) / 2.0) + ((1 + 5) / 2.0) + 7) / 3.0
      expect(result[factor1.id.to_s]['score']).to_not eq(unrounded_score)
      expect(result[factor1.id.to_s]['score']).to eq(unrounded_score.round(3))
      expect(result[factor4.id.to_s]['score']).to_not eq(unrounded_score)
      expect(result[factor4.id.to_s]['score']).to eq(unrounded_score.round(2))
    end

    it 'scoring_strategy :sub_factor_questions_sum' do
      factor1 = create(:factor, scoring_strategy: :sub_factor_questions_sum, precision: 1)
      factor2 = create(:factor, scoring_strategy: :questions)
      factor3 = create(:factor, scoring_strategy: :questions)
      factor1_sub_factor_hash = [
        create(:factors_sub_factor, factor: factor1, sub_factor: factor2),
        create(:factors_sub_factor, factor: factor1, sub_factor: factor3)
      ].index_by(&:sub_factor_id)
      factor_hash = {
        factor1.id => { factor: factor1, sub_factor_hash: factor1_sub_factor_hash },
        factor2.id => { factor: factor2, sub_factor_hash: {} },
        factor3.id => { factor: factor3, sub_factor_hash: {} }
      }
      factor_ids = factor_hash.keys
      scoring = {
        factor1.id.to_s => {
          'results' => [{ 'value' => [2, 3, 4], 'question_id' => 1 }, { 'value' => 5, 'question_id' => 2 }]
        },
        factor2.id.to_s => { 'results' => [{ 'value' => [1, 2], 'question_id' => 3 }] },
        factor3.id.to_s => {
          'results' => [{ 'value' => [1, 5], 'question_id' => 5 }, { 'value' => 7.15, 'question_id' => 8 }]
        }
      }
      result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                       norm: five_scale_norm })

      unrounded_score = (((1 + 2) / 2.0) + ((1 + 5) / 2.0) + 7.15)
      expect(result[factor1.id.to_s]['score']).to_not eq(unrounded_score)
      expect(result[factor1.id.to_s]['score']).to eq(unrounded_score.round(1))
    end
  end

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
    result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                     norm: five_scale_norm })

    expect(result).to including(
      factor1.id.to_s => hash_including(
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 },
          { 'value' => 2, 'question_id' => 3 }
        ],
        'score' => 3.33, # (((2 + 3 + 4) / 3) + 5 + 2) / 3.0 = 3.33,
        'norm_score' => nil
      ),
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
    result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                     norm: five_scale_norm })

    expect(result).to include(
      factor1.id.to_s => hash_including(
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 },
          { 'value' => 2, 'question_id' => 3 }
        ],
        'score' => ((2 + 3 + 4) / 3) + 5 + 2,
        'norm_score' => nil
      ),
      factor2.id.to_s => { 'results' => [], 'score' => nil, 'norm_score' => nil }
    )
  end

  it 'calculates additional statistics for questions strategy' do
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
          { 'value' => 1, 'question_id' => 1, 'max_value' => 1 }, # correct
          { 'value' => 0.5, 'question_id' => 2, 'max_value' => 1 }, # partial
          { 'value' => 0, 'question_id' => 3, 'max_value' => 1 } # incorrect
        ]
      },
      factor2.id.to_s => {
        'results' => [
          { 'value' => [2, 2], 'question_id' => 5, 'max_value' => 4 }, # correct
          { 'value' => [1, 0], 'question_id' => 6, 'max_value' => 3 } # partial
        ]
      }
    }

    factors_question_count = { factor1.id => 4, factor2.id => 3 }

    result = described_class.call!({
      factor_hash: factor_hash,
      factor_ids: factor_ids,
      scoring: scoring,
      norm: five_scale_norm,
      factors_question_count: factors_question_count
    })

    expect(result[factor1.id.to_s]).to eq(
      'results' => [
        { 'value' => 1, 'question_id' => 1, 'max_value' => 1 },
        { 'value' => 0.5, 'question_id' => 2, 'max_value' => 1 },
        { 'value' => 0, 'question_id' => 3, 'max_value' => 1 }
      ],
      'score' => 1.5,
      'percentage' => 50.0, # 2/4
      'questions_attempted' => 3,
      'total_questions' => 4,
      'questions_correct' => 1,
      'questions_partial_correct' => 1,
      'questions_incorrect' => 1,
      'questions_not_attempted' => 1,
      'norm_score' => nil
    )

    expect(result[factor2.id.to_s]).to eq(
      'results' => [
        { 'value' => [2, 2], 'question_id' => 5, 'max_value' => 4 },
        { 'value' => [1, 0], 'question_id' => 6, 'max_value' => 3 }
      ],
      'score' => 2.5,
      'percentage' => 67.0, # 2/3
      'questions_attempted' => 2,
      'total_questions' => 3,
      'questions_correct' => 1,
      'questions_partial_correct' => 1,
      'questions_incorrect' => 0,
      'questions_not_attempted' => 1,
      'norm_score' => nil
    )
  end

  describe 'when scoring_strategy: :custom_formula' do
    let(:factor1) { create(:factor) }
    let(:scoring) do
      {
        factor1.id.to_s => {
          'results' => [
            { 'value' => [2, 3, 4], 'question_id' => 1 },
            { 'value' => 5, 'question_id' => 2 },
            { 'value' => 2, 'question_id' => 3 }
          ],
          'score' => 5,
          'norm_score' => 3,
          'zscore' => 2,
          'percentage' => 90
        }
      }
    end
    let(:factor_hash) do
      {
        factor2.id => { factor: factor2, sub_factor_hash: {} },
        factor1.id => { factor: factor1, sub_factor_hash: {} }
      }
    end

    let(:factor_ids) { factor_hash.keys }

    let(:factor2) { create(:factor, scoring_strategy: :custom_formula, custom_formula:) }

    describe 'when custom formula contains assessment.norm_score' do
      let(:custom_formula) { "return assessment.norm_score(#{factor1.id})" }

      it 'calculates lua script properly' do
        result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                         norm: five_scale_norm })

        expect(result[factor2.id.to_s]['score']).to eq(3)
      end
    end

    describe 'when custom formula contains assessment.zscore' do
      let(:custom_formula) { "return assessment.zscore(#{factor1.id})" }
      it 'calculates lua script properly' do
        result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                         norm: five_scale_norm })

        expect(result[factor2.id.to_s]['score']).to eq(2)
      end
    end

    describe 'when custom formula contains assessment.raw_score' do
      let(:custom_formula) do
        "
         return assessment.raw_score(#{factor1.id})
        "
      end

      it 'calculates lua script properly' do
        result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                         norm: five_scale_norm })

        expect(result[factor2.id.to_s]['score']).to eq(5)
      end
    end

    describe 'when custom formula contains assessment.percentage' do
      let(:custom_formula) { "return assessment.percentage_answered(#{factor1.id})" }

      it 'calculates lua script properly' do
        result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                         norm: five_scale_norm })

        expect(result[factor2.id.to_s]['score']).to eq(90)
      end
    end

    describe 'when custom formula contains assessment.answer' do
      let(:custom_formula) { "return assessment.answer(\"$.question_id['answers'][0].value\")" }

      it 'calculates lua script properly' do
        answers = {}
        answers['question_id'] = { 'dirty' => false,
                                   'answers' => [{ 'index' => 0, 'value' => 2.2 },
                                                 { 'index' => 1, 'value' => 'Javascript' }] }
        result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                         norm: five_scale_norm, answers: answers })

        expect(result[factor2.id.to_s]['score']).to eq(2.2)
      end
    end

    describe 'formula factor can depend on other formula factor' do
      let(:custom_formula) { "return assessment.raw_score(#{factor1.id})" }

      it 'calculates lua script properly' do
        factor3 = create(
          :factor, scoring_strategy: :custom_formula,
          custom_formula: "return assessment.raw_score(#{factor2.id}) * 2"
        )
        factor4 = create(
          :factor, scoring_strategy: :custom_formula,
          custom_formula: "return assessment.raw_score(#{factor2.id}) * assessment.raw_score(#{factor3.id})"
        )

        factor_hash = {
          factor1.id => { factor: factor1, sub_factor_hash: {} },
          factor2.id => { factor: factor2, sub_factor_hash: {} },
          factor3.id => { factor: factor3, sub_factor_hash: {} },
          factor4.id => { factor: factor4, sub_factor_hash: {} }
        }

        result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_hash.keys, scoring: scoring,
                                         norm: five_scale_norm })

        factor2_score = 5
        factor3_score = factor2_score * 2
        factor4_score = factor2_score * factor3_score
        expect(result[factor2.id.to_s]['score']).to eq(factor2_score)
        expect(result[factor3.id.to_s]['score']).to eq(factor3_score)
        expect(result[factor4.id.to_s]['score']).to eq(factor4_score)
      end
    end

    describe 'has cyclic dependency' do
      let(:custom_formula) { "return assessment.raw_score(#{factor1.id})" }

      it 'returns nil' do
        factor3 = create(:factor, scoring_strategy: :custom_formula)
        # factor with cyclic dependency
        factor4 = create(
          :factor, scoring_strategy: :custom_formula,
          custom_formula: "return assessment.raw_score(#{factor2.id}) * assessment.raw_score(#{factor3.id})"
        )
        # factor with cyclic dependency
        factor3.update(custom_formula: "return assessment.raw_score(#{factor4.id}) * 2")

        factor5 = create(
          :factor, scoring_strategy: :custom_formula,
          custom_formula: "return assessment.norm_score(#{factor1.id}) + assessment.raw_score(#{factor2.id})"
        )

        factor_hash = {
          factor1.id => { factor: factor1, sub_factor_hash: {} },
          factor2.id => { factor: factor2, sub_factor_hash: {} },
          factor3.id => { factor: factor3, sub_factor_hash: {} },
          factor4.id => { factor: factor4, sub_factor_hash: {} },
          factor5.id => { factor: factor5, sub_factor_hash: {} }
        }

        result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_hash.keys, scoring: scoring,
                                         norm: five_scale_norm })

        expect(result[factor2.id.to_s]['score']).to eq(5)
        expect(result[factor3.id.to_s]['score']).to eq(nil)
        expect(result[factor4.id.to_s]['score']).to eq(nil)
        expect(result[factor5.id.to_s]['score']).to eq(3 + 5)
      end
    end

    describe 'when custom formula contains invalid data' do
      let(:custom_formula) { 'something' }
      it 'returns nil' do
        result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                         norm: five_scale_norm })

        expect(result[factor2.id.to_s]['score']).to eq(nil)
      end
    end

    describe 'when custom formula contains invalid factor' do
      let(:custom_formula) { 'return assessment.zscore(11100000000)' }
      it 'returns nil' do
        result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                         norm: five_scale_norm })

        expect(result[factor2.id.to_s]['score']).to eq(nil)
      end
    end

    describe 'lua helpers - round' do
      let(:custom_formula) { 'return helpers.round(2.267, 2)' }

      it 'it can return values rounded to specified digits' do
        result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                         norm: five_scale_norm })

        expect(result[factor2.id.to_s]['score']).to eq(2.27)
      end
    end

    describe 'lua helpers - average' do
      context 'when precision is passed' do
        let(:custom_formula) { 'return helpers.average({46.66, 61, 8}, nil)' }

        it 'it can find avarage using average helper' do
          result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                           norm: five_scale_norm })

          expect(result[factor2.id.to_s]['score']).to eq(38.553333333333335)
        end
      end

      context 'when precision is not passed' do
        let(:custom_formula) { 'return helpers.average({46.66, 61, 8})' }

        it 'it raise error when precision is not passed in average helper' do
          expect do
            described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                    norm: five_scale_norm })
          end.to raise_error(
            RuntimeError,
            'helpers.average: First parameter must be a Lua table, and second parameter is precision (integer)'
          )
        end
      end
    end
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
    result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                     norm: five_scale_norm })

    expect(result).to include(
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
      factor3.id.to_s => hash_including(
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }, { 'value' => 7, 'question_id' => 8 }],
        'score' => 5.0, # ((1 + 5)/2.0 + 7) / 2.0 = 5.0
        'norm_score' => nil
      ),
      factor4.id.to_s => hash_including(
        'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }],
        'score' => 2.33, # (2 + 2 + 3) / 3.0 = 2.33
        'norm_score' => nil
      ),
      factor5.id.to_s => hash_including('results' => [], 'score' => nil, 'norm_score' => nil),
      factor6.id.to_s => hash_including(
        'results' => [{ 'value' => [1, 1, 3], 'question_id' => 7 }],
        'score' => 1.67, # (1 + 1 + 3) / 3.0 = 1.67
        'norm_score' => nil
      )
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
    result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                     norm: five_scale_norm })

    expect(result).to include(
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
      factor3.id.to_s => hash_including(
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }, { 'value' => 7, 'question_id' => 8 }],
        'score' => ((((1 + 5) / 2.0) + 7) / 2.0).round(2),
        'norm_score' => nil
      ),
      factor4.id.to_s => hash_including(
        'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }], 'score' => ((2 + 2 + 3) / 3.0).round(2),
        'norm_score' => nil
      ),
      factor5.id.to_s => hash_including('results' => [], 'score' => nil, 'norm_score' => nil),
      factor6.id.to_s => hash_including(
        'results' => [{ 'value' => [1, 1, 3], 'question_id' => 7 }], 'score' => ((1 + 1 + 3) / 3.0).round(2),
        'norm_score' => nil
      )
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
    result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                     norm: five_scale_norm })

    expect(result).to include(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 }
        ],
        'score' => 2.42, # (1.0 * 1 + 3.0 * 3 + 2.33 * 4) / (1 + 3 + 4) = 2.42
        'norm_score' => nil
      },
      factor2.id.to_s => hash_including(
        'results' => [{ 'value' => [0, 2], 'question_id' => 3 }], 'score' => 1.0, # (0 + 2) / 2.0 = 1.0
        'norm_score' => nil
      ),
      factor3.id.to_s => hash_including(
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }], 'score' => 3.0, # (1 + 5) / 2.0 = 3.0
        'norm_score' => nil
      ),
      factor4.id.to_s => hash_including(
        'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }], 'score' => 2.33, # (2 + 2 + 3) / 3.0 = 2.33
        'norm_score' => nil
      ),
      factor5.id.to_s => hash_including('results' => [], 'score' => nil, 'norm_score' => nil)
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
    result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                     norm: five_scale_norm, factor_norm_hash: factor_norm_hash })

    expect(result).to include(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 }
        ],
        'score' => 1.75, # (1.0 * 1 + 2.0 * 3) / (1 + 3) = 1.75
        'norm_score' => 1
      },
      factor2.id.to_s => hash_including(
        'results' => [{ 'value' => [0, 2], 'question_id' => 3 }], 'score' => 1.0, # (0 + 2) / 2.0 = 1.0
        'norm_score' => 1
      ),
      factor3.id.to_s => hash_including(
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }], 'score' => 3.0, # (1 + 5) / 2.0 = 3.0
        'norm_score' => 2
      )
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
    result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                     norm: five_scale_norm })

    expect(result).to include(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 }
        ],
        'score' => 71.43, # (1 + 4) * 100 / (1 + 2 + 4) = 71.43
        'norm_score' => nil
      },
      factor2.id.to_s => hash_including(
        'results' => [{ 'value' => [0, 2], 'question_id' => 3 }],
        'score' => 1.0, # (0 + 2) / 2.0 = 1.0
        'norm_score' => nil
      ),
      factor3.id.to_s => hash_including(
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }],
        'score' => 3.0, # (1 + 5) / 2.0 = 3.0
        'norm_score' => nil
      ),
      factor4.id.to_s => hash_including(
        'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }],
        'score' => 2.33, # (2 + 2 + 3) / 3.0 = 2.33
        'norm_score' => nil
      )
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
      { factor_hash: factor_hash, factor_ids: [factor.id], scoring: scoring,
        norm: five_scale_norm, factor_norm_hash: { factor.id => factors_norm } }
    )

    expect(result).to include(
      factor.id.to_s => hash_including(
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 },
          { 'value' => 2, 'question_id' => 3 }
        ],
        'score' => 3.33, # (((2 + 3 + 4) / 3) + 5 + 2) / 3.0 = 3.33,
        'norm_score' => 2
      )
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
      { factor_hash: factor_hash, factor_ids: [factor.id],
        scoring: scoring, norm: percentile_norm, factor_norm_hash: { factor.id => factors_norm } }
    )

    expect(result).to include(
      factor.id.to_s => hash_including(
        'results' => [
          { 'value' => 2, 'question_id' => 2 },
          { 'value' => 1, 'question_id' => 3 }
        ],
        'score' => (2 + 1) / 2.0,
        'zscore' => 0.16667,
        'norm_score' => Ztable.percentile(0.16667)
      )
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

    result = described_class.call!(
      { factor_hash: factor_hash, factor_ids: factor_ids,
        scoring: {}, norm: five_scale_norm, factor_norm_hash: {}, external_results: external_results }
    )

    expect(result).to eq(
      factor1.id.to_s => { 'percentage' => 1.0, 'zscore' => 4.0 },
      factor2.id.to_s => { 'score' => 5.0, 'norm_score' => nil }
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

    result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                     norm: five_scale_norm,
                                     factors_question_count: {
                                       factor1.id => 3,
                                       factor2.id => 0
                                     } })

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
    result = described_class.call!({ factor_hash: factor_hash, factor_ids: factor_ids, scoring: scoring,
                                     norm: five_scale_norm })

    expect(result).to include(
      factor1.id.to_s => {
        'results' => [
          { 'value' => [2, 3, 4], 'question_id' => 1 },
          { 'value' => 5, 'question_id' => 2 }
        ],
        'score' => 19.32, # (1.0 * 1 + 3.0 * 3 + 2.33 * 4) = 19.32
        'norm_score' => nil
      },
      factor2.id.to_s => hash_including(
        'results' => [{ 'value' => [0, 2], 'question_id' => 3 }], 'score' => 1.0, # (0 + 2) / 2.0 = 1.0
        'norm_score' => nil
      ),
      factor3.id.to_s => hash_including(
        'results' => [{ 'value' => [1, 5], 'question_id' => 5 }], 'score' => 3.0, # (1 + 5) / 2.0 = 3.0
        'norm_score' => nil
      ),
      factor4.id.to_s => hash_including(
        'results' => [{ 'value' => [2, 2, 3], 'question_id' => 6 }], 'score' => 2.33, # (2 + 2 + 3) / 3.0 = 2.33
        'norm_score' => nil
      ),
      factor5.id.to_s => hash_including('results' => [], 'score' => nil, 'norm_score' => nil)
    )
  end

  context 'when strategy module returns nil' do
    it 'handles nil extending_scoring gracefully during reduce' do
      factor1 = create(:factor, scoring_strategy: :questions)
      factor2 = create(:factor, scoring_strategy: :questions)

      factor_hash = {
        factor1.id => { factor: factor1, sub_factor_hash: {} },
        factor2.id => { factor: factor2, sub_factor_hash: {} }
      }

      scoring = {
        factor1.id.to_s => { 'results' => [{ 'value' => [2, 3, 4], 'question_id' => 1 }] }
      }

      strategy_module = '::UsersResults::Scoring::AddScoreByStrategy::Questions'.constantize
      allow(strategy_module).to receive(:call!).and_return(nil,
                                                           scoring.merge(factor2.id.to_s => { 'results' => [{
                                                             'value' => [1, 2], 'question_id' => 2
                                                           }] }))

      result = described_class.call!({
        factor_hash: factor_hash,
        factor_ids: factor_hash.keys,
        scoring: scoring,
        norm: nil
      })

      expect(result).to be_a(Hash)
    end
  end
end

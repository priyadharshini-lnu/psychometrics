# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::CalculateAgileScoring do
  describe "it broadcasts :invalid when users_result doesn't have answers" do
    let(:users_result) { create(:users_result, answers: nil) }

    subject { described_class.call(users_result) }

    it 'broadcasts :invalid' do
      expect { subject }.to broadcast(:invalid)
    end
  end

  describe 'it broadcasts :ok when users_result is complete' do
    before(:each) do
      setup_data
    end

    subject { described_class.call!(@users_result) }

    it 'calculates and saves agile score' do
      expect(subject).to be
    end

    it 'adds scoring for all factors' do
      scoring = subject
      factors = @norm.factors.pluck(:id)
      factors.each { |id| expect(scoring).to include(id.to_s) }
    end

    it 'counts correct answers properly' do
      scoring = subject
      factor = @factor_ids.first.to_s
      score = scoring[factor]['score']

      expect(score).to eq(1.0)
    end

    it 'adds factor score' do
      factor_score = subject.first.last
      expect(factor_score).to include('score')
    end

    it 'adds zscore' do
      factor_score = subject.first.last
      expect(factor_score).to include('zscore')
    end

    it 'adds normed score' do
      factor_score = subject.first.last
      expect(factor_score).to include('norm_score')
    end
  end

  describe 'calculations by strategy' do
    before(:each) do
      setup_data_for_average_strategy
    end

    subject { described_class.call!(@users_result) }

    it 'calculates and saves agile score' do
      expect(subject).to be
    end

    it 'calculates score by sub-factors average strategy' do
      scoring = subject

      # (0.5 * 1 + 0.5 * 2 + 1.0 * 3 + 0.5 * 4) /  (1 + 2 + 3 + 4) = 0.65
      expect(scoring[@factor_ids.first.to_s]['score']).to eq(0.65)

      expect(scoring[@factor_ids.second.to_s]['score']).to eq(0.5)
      expect(scoring[@factor_ids.third.to_s]['score']).to eq(0.5)
      expect(scoring[@factor_ids.fourth.to_s]['score']).to eq(1)
      expect(scoring[@factor_ids.fifth.to_s]['score']).to eq(0.5)
    end
  end

  def get_questions(scope, num = 1)
    Array.new(num) do |index|
      { id: "q-#{scope}-#{index}", answers: [['answer']] }
    end
  end

  def get_scoring(factor_id, item_score = 1)
    [{ factorId: factor_id, itemScore: item_score }]
  end

  def get_block(scoring_factor, num_questions = 2)
    {
      id: "block-of-#{scoring_factor}",
      type: 'EquationSolver',
      scoring: get_scoring(scoring_factor),
      questions: get_questions(scoring_factor, num_questions)
    }
  end

  def prepare_scene(scoring_factors)
    blocks = scoring_factors.map { |scoring_factor| get_block(scoring_factor) }
    { id: 'scene-1', type: 'AssessmentScene', data: { blocks: blocks } }
  end

  def prepare_answers(scoring_factors)
    results = { 'answers' => {}, 'group_id' => 'group-1' }
    scoring_factors.each do |scoring_factor|
      2.times do |index|
        question_id = "q-#{scoring_factor}-#{index}"
        results['answers'][question_id] = {
          'id' => question_id,
          'answers' => ['answer'],
          'group_id' => 'group-1'
        }
      end
    end

    results
  end

  def feed_in_wrong_answers(results, step = 3)
    answers = results['answers'].to_a

    indices = (step - 1).step(answers.size - 1, step).to_a
    indices.each do |index|
      answer = answers[index].last
      answer['answers'] = ['wrong-answer']
    end

    results
  end

  def setup_data
    @norm = create(:norm, :percentile)
    @factor_ids = @norm.factors.pluck(:id).sort.first(2)

    config = {
      normId: @norm.id,
      groups: [{ id: 'group-1', scenes: [prepare_scene(@factor_ids)] }]
    }
    results = [prepare_answers(@factor_ids)]
    user_assessment = create(
      :user_assessment,
      :with_result,
      answers: results,
      status: :completed,
      completed_at: Time.now,
      norm_id: @norm.id,
      assessment: create(:assessment, dimension_id: @norm.dimension_id)
    )
    @users_result = user_assessment.users_result
    @agile = create(:agile, assessment: user_assessment.assessment, config: config)
  end

  def setup_data_for_average_strategy
    @norm = create(:norm, :percentile)
    @factor_ids = @norm.factors.pluck(:id).sort

    factor1 = @norm.factors.find_by(id: @factor_ids.first)
    factor1.scoring_strategy = :sub_factors_average
    factor1.save

    create(:factors_sub_factor, factor: factor1, sub_factor_id: @factor_ids.second, weight: 1) # 0.5
    create(:factors_sub_factor, factor: factor1, sub_factor_id: @factor_ids.third, weight: 2) # 0.5
    create(:factors_sub_factor, factor: factor1, sub_factor_id: @factor_ids.fourth, weight: 3) # 1.0
    create(:factors_sub_factor, factor: factor1, sub_factor_id: @factor_ids.fifth, weight: 4) # 0.5

    config = {
      normId: @norm.id,
      groups: [{ id: 'group-1', scenes: [prepare_scene(@factor_ids)] }]
    }

    answers = prepare_answers(@factor_ids)
    results = [feed_in_wrong_answers(answers)]

    user_assessment = create(
      :user_assessment,
      :with_result,
      answers: results,
      assessment: create(:assessment, dimension: @norm.dimension),
      completed_at: Time.now,
      norm_id: @norm.id
    )
    @users_result = user_assessment.users_result
    @agile = create(:agile, assessment: user_assessment.assessment, config: config)
  end
end

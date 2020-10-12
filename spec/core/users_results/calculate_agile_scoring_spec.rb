# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::CalculateAgileScoring do
  describe 'it broadcasts :invalid when users_result is incomplete' do
    before(:all) do
      setup_data
    end

    subject { described_class.call(@users_result, @users_result.subject) }

    it 'broadcasts :invalid' do
      expect { subject }.to broadcast(:invalid)
    end

    it 'dont broadcast :ok' do
      expect { subject }.not_to broadcast(:ok)
    end

    it 'dont make transaction' do
      expect_any_instance_of(described_class).not_to receive(:calculate)
      subject
    end
  end

  describe 'it broadcasts :ok when users_result is complete' do
    before(:context) do
      setup_data(true)
    end

    subject { described_class.call(@users_result, @users_result.subject, true) }

    it { expect { subject }.to broadcast(:ok) }

    it 'calculates and saves agile score' do
      expect(@users_result.scoring).to be
    end

    it 'adds scoring for all factors' do
      scoring = @users_result.scoring
      factors = @norm.factors.pluck(:id)
      factors.each { |id| expect(scoring).to include(id.to_s) }
    end

    it 'counts correct answers properly' do
      scoring = @users_result.scoring
      factor = @factor_ids.first.to_s
      block = scoring[factor]['blocks'].first
      score = block['score']

      expect(score).to eq(2)
    end

    it 'adds factor score' do
      factor_score = @users_result.scoring.first.last
      expect(factor_score).to include('score')
    end

    it 'adds zscore' do
      factor_score = @users_result.scoring.first.last
      expect(factor_score).to include('zscore')
    end

    it 'adds normed score' do
      factor_score = @users_result.scoring.first.last
      expect(factor_score).to include('norm_score')
    end
  end

  describe 'calculations by strategy' do
    before(:context) do
      setup_data_for_average_strategy
    end

    subject { described_class.call(@users_result, @users_result.subject) }

    it { expect { subject }.to broadcast(:ok) }

    it 'calculates and saves agile score' do
      expect(@users_result.scoring).to be
    end

    it 'calculates score by sub-factors average strategy' do
      scoring = @users_result.scoring

      # sub_factor_scores: { sub_factor_id => { :score=>2, :weight=>1.0 }, ... }
      # (1.0 * 1 + 2.0 * 1 + 3.0 * 2 + 4.0 * 1) / (1.0 + 2.0 + 3.0 + 4.0) = 1.3
      expect(scoring[@factor_ids.first.to_s]['score']).to eq(1.3)

      expect(scoring[@factor_ids.second.to_s]['score']).to eq(1)
      expect(scoring[@factor_ids.third.to_s]['score']).to eq(1)
      expect(scoring[@factor_ids.fourth.to_s]['score']).to eq(2)
      expect(scoring[@factor_ids.fifth.to_s]['score']).to eq(1)
    end
  end

  def get_questions(scope, num = 1)
    Array.new(num) do |index|
      { 'id': "q-#{scope}-#{index}", 'answers': [['answer']] }
    end
  end

  def get_scoring(factor_id, item_score = 1)
    [{ 'factorId': factor_id, 'itemScore': item_score }]
  end

  def get_block(scoring_factor, num_questions = 2)
    {
      'id': "block-of-#{scoring_factor}",
      'scoring': get_scoring(scoring_factor),
      'questions': get_questions(scoring_factor, num_questions)
    }
  end

  def prepare_scene(scoring_factors)
    blocks = scoring_factors.map { |scoring_factor| get_block(scoring_factor) }
    { 'id': 'scene-1', 'type': 'AssessmentScene', 'data': { blocks: blocks } }
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

  def setup_data(complete = false)
    @norm = create(:norm, :percentile)
    @factor_ids = @norm.factors.pluck(:id).sort.first(2)

    config = {
      'normId': @norm.id,
      'groups': [{ 'id': 'group-1', 'scenes': [prepare_scene(@factor_ids)] }]
    }
    results = [prepare_answers(@factor_ids)]

    @users_result = create(:users_result, :with_user_assessment, answers: results)
    @agile = create(:agile, assessment: @users_result.assessment, config: config)

    if complete
      @users_result.update_columns(
        status: :completed, completed_at: Time.now, norm_id: @norm.id, norm_type: 'percentile'
      )
    end
  end

  def setup_data_for_average_strategy
    @norm = create(:norm, :percentile)
    @factor_ids = @norm.factors.pluck(:id).sort

    factor1 = @norm.factors.find_by(id: @factor_ids.first)
    factor1.scoring_strategy = :sub_factors_average
    factor1.save

    create(:factors_sub_factor, factor: factor1, sub_factor_id: @factor_ids.second, weight: 1)
    create(:factors_sub_factor, factor: factor1, sub_factor_id: @factor_ids.third, weight: 2)
    create(:factors_sub_factor, factor: factor1, sub_factor_id: @factor_ids.fourth, weight: 3)
    create(:factors_sub_factor, factor: factor1, sub_factor_id: @factor_ids.fifth, weight: 4)

    config = {
      'normId': @norm.id,
      'groups': [{ 'id': 'group-1', 'scenes': [prepare_scene(@factor_ids)] }]
    }

    answers = prepare_answers(@factor_ids)
    results = [feed_in_wrong_answers(answers)]

    @users_result = create(:users_result, :with_user_assessment, answers: results)
    @agile = create(:agile, assessment: @users_result.assessment, config: config)

    @users_result.update_columns(status: :completed, completed_at: Time.now, norm_id: @norm.id, norm_type: 'percentile')
  end
end

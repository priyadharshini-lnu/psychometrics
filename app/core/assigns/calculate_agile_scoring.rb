# frozen_string_literal: true

module Assigns
  class CalculateAgileScoring < BaseCommand
    private_attr_accessor :assign, :agile, :norm, :results, :scoring

    def initialize(assign)
      @assign = assign
      @agile = assign.assessment.agile
    end

    def call
      return broadcast(:invalid) unless assign.completed?
      return broadcast(:invalid) if assign.norm_data.blank? || assign.norm_data.dig('id').nil?
      return broadcast(:invalid) if assign.results.blank?

      @results = assign.results.map { |hash| hash['answers'] }.reduce(&:merge)
      @norm = Norm.
              includes(:factors_norms, factors: %i[sub_factors factors_sub_factors]).
              find_by(id: assign.norm_data['id'])

      # { factor_id => {"blocks" => [] }, ... }
      @scoring = Hash[norm.factors.map(&:id).product([blocks: []])].with_indifferent_access

      calculate
      broadcast(:ok, assign.update(scoring: scoring))
    end

    private

    def get_factors_norm(factor_id)
      norm.factors_norms.find { |fn| fn.factor_id == factor_id }
    end

    def get_factor(factor_id)
      norm.factors.find { |f| f.id == factor_id }
    end

    def get_factors_sub_factor(factor_id, sub_factor_id)
      factor = get_factor(factor_id)
      factor.factors_sub_factors.find { |f| f.sub_factor_id == sub_factor_id }
    end

    def calculate
      prepare_scoring_with_blocks
      extend_with_factor_scores
      extend_with_norm_score
    end

    # { factor_id => {"blocks" => [{id: 'block-1', scoring: [{ factorId, itemScore }], questions => [...]}] }, ... }
    def prepare_scoring_with_blocks
      assessments = agile.config['groups'].map do |group|
        group['scenes'].select { |s| s['type'] == 'AssessmentScene' }
      end.flatten

      assessments.each do |assessment|
        blocks = assessment.dig('data', 'blocks')
        blocks.each do |block|
          block_scoring_factors = block.dig('scoring')
          block_scoring_factors&.each do |scoring_factor|
            factor = get_factor(scoring_factor['factorId'])

            scoring[scoring_factor['factorId']]['blocks'] << block
            if factor.sub_factors_average_strategy?
              scoring[scoring_factor['factorId']]['sub_factors'] = factor.sub_factors.pluck(:id)
            end
          end
        end
      end
    end

    def extend_with_factor_scores
      scoring.tap do |original_scoring|
        original_scoring.each do |factor_id, data|
          factor = get_factor(factor_id)
          data['score'] = calculate_factor_score(factor, data)
        end
      end
    end

    def calculate_factor_score(factor, data)
      return data['score'] if data.key?('score')

      score = if factor.questions_strategy?
                by_questions_strategy(data)
              elsif factor.sub_factors_average_strategy?
                by_sub_factors_average_strategy(factor, data)
              end
      score
    end

    def extend_with_norm_score
      scoring.tap do |original_scores|
        original_scores.each do |factor_id, original_score|
          factor_norm = get_factors_norm(factor_id)
          props = factor_norm&.props&.first

          next if props.blank?

          factor_score = original_score['score']
          zscore = ((factor_score.to_f - props['mean'].to_f) / props['standard_deviation'].to_f).round(5)
          norm_score = Ztable.percentile(zscore)

          original_score['zscore'] = zscore
          original_score['norm_score'] = norm_score
        end
      end
    end

    def count_correct_answers(questions)
      questions.count do |question|
        question_result = results[question['id']]

        # We have maxItems in config, which indicates how many questions inside a block
        # would be shown to user. Also questions are randomised with a limited duration,
        # so only some questions might be answered
        next unless question_result

        result = [question_result['answers']]
        answer = question['answers']

        next unless answer

        (result & answer).any?
      end
    end

    def by_questions_strategy(data)
      extend_blocks_with_scores(data['blocks'])

      item_score = data['itemScore'] || 1
      block_scores = data['blocks'].map { |block| block['score'] }
      block_scores.sum { |block_score| block_score * item_score }
    end

    def extend_blocks_with_scores(blocks)
      blocks.tap do |original_blocks|
        original_blocks.each do |block|
          questions = block.dig('questions')
          block['score'] = count_correct_answers(questions)
        end
      end
    end

    def by_sub_factors_average_strategy(factor, data)
      sub_factor_ids = data.dig('sub_factors')

      nil if sub_factor_ids.blank?

      # { factor_id => <score>, ... }
      sub_factor_scores = prepare_sub_factors(factor, sub_factor_ids)
      calculate_average(calculate_sub_factor_scores(sub_factor_scores))
    end

    def prepare_sub_factors(factor, sub_factor_ids)
      # { factor_id => <score>, ... }
      sub_factor_scores = Hash[sub_factor_ids.zip(sub_factor_ids.map { |id| { 'score': scoring[id]['score'] } })]
      sub_factor_scores.tap do |sub_factors|
        sub_factors.each do |sub_factor_id, score_hash|
          score_hash[:weight] = get_factors_sub_factor(factor.id, sub_factor_id).weight
        end
      end

      sub_factor_scores
    end

    def calculate_sub_factor_scores(sub_factor_scores)
      sub_factor_scores.select { |_, sub_factor_score| sub_factor_score[:score].nil? }.tap do |unscored_factors|
        unscored_factors.each do |factor_id, score_hash|
          factor = get_factor(factor_id)
          factor_score = calculate_factor_score(factor, scoring[factor_id])
          score_hash[:score] = factor_score
          scoring[factor_id]['score'] = factor_score
        end
      end

      sub_factor_scores
    end

    def calculate_average(scores)
      total = scores.each_with_object(sum: 0, count: 0) do |(_, config), memo|
        weight = config[:weight] || 1

        memo[:sum] += config[:score] * weight
        memo[:count] += weight
      end

      total[:sum] / total[:count].to_f
    end
  end
end

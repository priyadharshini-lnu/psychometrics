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
      @norm = Norm.includes(:factors_norms, factors: :sub_factors).find_by(id: assign.norm_data['id'])

      # { factor_id => {"blocks" => [] }, ... }
      @scoring = Hash[norm.factors.map(&:id).product([blocks: []])].with_indifferent_access

      calculate
      broadcast(:ok, assign.update(scoring: scoring))
      # broadcast(:ok, @scoring)
    end

    private

    def get_factors_norm(factor_id)
      norm.factors_norms.find { |fn| fn.factor_id == factor_id }
    end

    def get_factor(factor_id)
      norm.factors.find { |f| f.id == factor_id }
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
              scoring[scoring_factor['factorId']]['subFactorIds'] = factor.sub_factors.pluck(:id)
            end
          end
        end
      end
    end

    def extend_with_factor_scores
      scoring.tap do |original_scoring|
        original_scoring.each do |factor_id, data|
          factor = get_factor(factor_id)
          original_scoring[factor_id]['score'] = calculate_factor_score(factor, data)
        end
      end
    end

    def calculate_factor_score(factor, data)
      score = if factor.questions_strategy?
                extend_blocks_with_scores(data[:blocks])

                item_score = data['itemScore'] || 1
                block_scores = data['blocks'].map { |block| block['score'] }
                block_scores.sum { |block_score| block_score * item_score }
              elsif factor.sub_factors_average_strategy?
                100
              end
      score
    end

    def extend_blocks_with_scores(blocks)
      blocks.tap do |original_blocks|
        original_blocks.each do |block|
          questions = block.dig('questions')
          block['score'] = count_correct_answers(questions)
        end
      end
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
  end
end

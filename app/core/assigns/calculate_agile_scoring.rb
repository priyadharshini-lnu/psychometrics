# frozen_string_literal: true

module Assigns
  class CalculateAgileScoring < BaseCommand
    private_attr_accessor :assign, :agile, :norm, :scoring

    def initialize(assign)
      @assign = assign
      @agile = assign.assessment.agile
    end

    def call
      return broadcast(:invalid) unless assign.completed?
      return broadcast(:invalid) if assign.norm_data.blank? || assign.norm_data.dig('id').nil?

      @norm = Norm.includes(:factors_norms, factors: :sub_factors).find_by(id: assign.norm_data['id'])
      @scoring = Hash[norm.factors.map(&:id).product([blocks: []])].with_indifferent_access

      calculate
      broadcast(:ok, assign.update(scoring: scoring))
    end

    private

    def calculate
      extend_with_block_counts
      extend_with_norm_score
    end

    def extend_with_block_counts
      return if assign.results.blank?

      results = assign.results.map { |hash| hash['answers'] }.reduce(&:merge)

      agile.config['groups'].each do |group|
        group['scenes'].select { |s| s['type'] == 'AssessmentScene' }.each do |assessment|
          assessment.dig('data', 'blocks').each { |block| calculate_block_score(block, results) }
        end
      end
    end

    def extend_with_norm_score
      scoring.tap do |original_scores|
        original_scores.each do |factor_id, original_score|
          blocks = original_score['blocks'].flat_map(&:values)
          factor_score = blocks.sum { |hash| hash[:score] * hash[:item_score] }

          factor_norm = get_factors_norm(factor_id)
          props = factor_norm&.props&.first

          next if props.blank?

          zscore = ((factor_score.to_f - props['mean'].to_f) / props['standard_deviation'].to_f).round(5)
          norm_score = Ztable.percentile(zscore)

          original_score['score'] = factor_score
          original_score['zscore'] = zscore
          original_score['norm_score'] = norm_score
        end
      end
    end

    def calculate_block_score(block, results)
      block_factors = block.dig('scoring')
      questions = block.dig('questions')

      block_factors&.each do |item|
        factor = get_factor(item['factorId'])

        # Calculate score for this block by factor strategy
        score = if factor.questions_strategy?
                  by_questions_strategy(questions, results)
                elsif factor.sub_factors_average_strategy?
                  by_sub_factors_average_strategy(questions, results, factor)
                end

        scoring[item['factorId']]['blocks'] << {
          block['id'] => {
            score: score,
            item_score: item['itemScore'] || 1
          }
        }
      end
    end

    def get_factors_norm(factor_id)
      norm.factors_norms.find { |fn| fn.factor_id == factor_id }
    end

    def get_factor(factor_id)
      norm.factors.find { |f| f.id == factor_id }
    end

    def by_questions_strategy(questions, results)
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

    def by_sub_factors_average_strategy(questions, results, factor)
      sub_factors = factor.sub_factors.map(:id)
    end
  end
end

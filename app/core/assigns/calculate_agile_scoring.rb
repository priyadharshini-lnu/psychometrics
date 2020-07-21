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

      @norm = Norm.includes(:factors_norms, :factors).find_by(id: assign.norm_data['id'] || 120)
      @scoring = Hash[norm.factors.map(&:id).product([blocks: []])].with_indifferent_access

      calculate
      # TODO: Refactor - we could as well update assign here?
      broadcast(:ok, scoring)
    end

    private

    def calculate
      %i[extend_with_block_count extend_with_norm_score].inject { |_, method| send(method) }
    end

    def extend_with_block_counts
      agile_config = agile.config
      groups = agile_config['groups'].reject { |group| group['id'] == 'intro-group' }
      results = assign.results.map { |hash| hash['answers'] }.reduce(&:merge)

      groups.each do |group|
        group['scenes'].select { |s| s['type'] == 'AssessmentScene' }.each do |assessment|
          assessment.dig('data', 'blocks').each do |block|
            # factor = norm.factors.find_by(id: block['factor_id'])
            factor = norm.factors[rand(norm.factors.size)] # TODO: refactor
            questions = block.dig('questions')

            # Count correct answers in this block
            correct_answer_count = count_answers(questions, results)

            scoring[factor.id]['blocks'] << {
              block['id'] => {
                count: correct_answer_count,
                # TODO: Refactor: should have a default item score?
                item_score: block['item_score'] || 1
              }
            }
          end
        end
      end
    end

    def extend_with_norm_score
      scoring.tap do |original_scores|
        original_scores.each do |factor_id, original_score|
          blocks = original_score['blocks'].flat_map(&:values)
          factor_score = blocks.reduce(0) { |sum, hash| sum + (hash[:count] * hash[:item_score]) }

          props = norm.factors_norms.find_by(norm_id: norm.id, factor_id: factor_id).props.first
          zscore = (factor_score - props['mean'].to_i) / props['standard_deviation'].to_i

          normed_score = Ztable.percentile(zscore)
          puts "factor_score: #{factor_score}, zscore: #{zscore}, normed_score: #{normed_score}"

          original_score['factor_score'] = factor_score
          original_score['zscore'] = zscore
          original_score['normed_score'] = normed_score

          original_score.delete('blocks')
        end
      end
    end

    def count_answers(questions, results)
      questions.count do |question|
        question_result = results[question['id']]

        # TODO: Refactor - can a question be skipped in the assessment?
        # Only way this could end-up being nil is in that scenario
        next unless question_result

        result = question_result['answers']
        answer = question['answers']

        # TODO: Refactor - since the assumption is that
        # the answers will be available with the question
        next unless answer

        (result & answer).any?
      end
    end
  end
end

# frozen_string_literal: true

module Assigns
  class CalculateAgileScoring < BaseCommand
    private_attr_accessor :assign, :agile

    def initialize(assign)
      @assign = assign
      @agile = assign.assessment.agile
    end

    def call
      scoring = {}
      agile_config = agile.config
      norm = Norm.includes(:factors).find_by(id: assign.norm_data['id'] || 120)

      groups = agile_config['groups'].reject { |group| group['id'] == 'intro-group' }

      assign.results.each do |result|
        group_id = result.dig('group_id')
        group = groups.find { |group| group['id'] == group_id }
        assessment = group['scenes'].find { |scene| scene['type'] == 'AssessmentScene' }
        blocks = assessment.dig('data', 'blocks')
        questions = blocks.flat_map do |block|
          block.dig('questions').tap do |questions|
            questions.map { |q| q['block_id'] = block['id'] }
          end
        end

        result['answers'].each do |question_id, response|
          next if question_id =~ /(\w+-[p]+\d+)/i
          answers = response.dig('answers')
          question = questions.find { |q| q['id'] == response['id'] }

          block = blocks.find { |block| block['id'] == question['block_id'] }
          factor = norm.factors.find_by(id: block['factor_id'])
          item_score = block['item_score']

          puts "response: #{response}, factor: #{factor}, item_score: #{factor} question: #{question}"

          # Calculate the factor score
          # Calculate zScore
          # Get percentile
          # Save to scoring under factor key
        end
      end

      # Save scoring
    end
  end
end

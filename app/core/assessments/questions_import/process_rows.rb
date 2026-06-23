# frozen_string_literal: true

module Assessments
  module QuestionsImport
    class ProcessRows < BaseCommand
      private_attr_reader :rows

      HEADERS_WHOSE_SUB_HEADER_CAN_BE_DOWNCASED = ['Block', 'Question', 'Required Validation'].freeze

      def initialize(rows)
        @rows = rows
      end

      # This method processes the rows of the excel file and returns an array of hashes like below:
      # [
      #   {
      #     'block' => { 'Name' => 'Default Block' },
      #     'question' => { 'Name' => 'Q1', 'Type' => 'Text Entry' },
      #     'question_property' => { 'type' => 'Single Line' },
      #   },
      #   {
      #     'block' => { 'name' => 'YTI'},
      #     'question' => { 'name' => 'Q5', 'type' => 'Multiple Choice'},
      #     'question_property' => {
      #       'type' => 'Multiple Answers',
      #       'questionText' => 'Which of these are gulf countries',
      #       'choicesTexts' => ['UAE', 'KSA'],
      #       'randomization: { type' => nil }
      #     },
      #     'scoring' => { 'Accountability' => nil, 'Grit' => nil }
      #   }
      # ]
      def call # rubocop:disable Metrics/PerceivedComplexity,Metrics/CyclomaticComplexity
        headers = rows[0]
        sub_headers = rows[1]
        questions = rows[2..]

        processed_rows = questions.each_with_object([]) do |question_data, array|
          hash = {}
          question_data.each.with_index do |column_value, index|
            next if column_value.blank?

            header = headers[index]
            sub_header = sub_headers[index]
            next if header.blank? || sub_header.blank?

            sub_header = sub_header.downcase if HEADERS_WHOSE_SUB_HEADER_CAN_BE_DOWNCASED.include?(header)
            if header == 'Scoring'
              hash['scoring'] ||= {}
              column_value.strip.split("\n").each do |factor_score|
                factor_name, _, scores = factor_score.rpartition(':')
                hash['scoring'][factor_name] = scores
              end
            elsif header == 'AI Scoring Config'
              hash['ai_scoring_config'] ||= {}
              parse_ai_scoring_config(hash['ai_scoring_config'], sub_header, column_value)
            else
              Utility::Hash.set_nested_key(hash, "#{header.tr(' ', '_').downcase}.#{sub_header}", column_value)
            end
          end
          array << hash
        end

        broadcast :ok, processed_rows
      end

      private

      def parse_ai_scoring_config(config_hash, sub_header, column_value)
        column_value.strip.split(/\r?\n/).each do |line|
          factor_name, value = split_factor_line(line)
          next if factor_name.blank?

          config_hash[factor_name] ||= {}

          if sub_header == 'what_to_look_for'
            config_hash[factor_name]['what_to_look_for'] = value
          elsif sub_header == 'score_definitions'
            config_hash[factor_name]['score_definitions'] = parse_score_definitions(value)
          end
        end
      end

      def split_factor_line(line)
        separator_index = line.index(': ')
        return [nil, nil] unless separator_index

        factor_name = line[0...separator_index].strip
        value = line[(separator_index + 2)..].strip
        [factor_name, value]
      end

      def parse_score_definitions(value)
        value.split('|').filter_map do |pair|
          score, _, definition = pair.partition(':')
          next if score.blank?

          { 'score' => score.strip, 'definition' => definition.strip }
        end
      end
    end
  end
end

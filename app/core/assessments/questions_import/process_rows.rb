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
      #     'question_+property' => { 'type' => 'Single Line' },
      #   },
      #   {
      #     'block' => { 'name' => 'YTI'},
      #     'question' => { 'name' => 'Q5', 'type' => 'Multiple Choice'},
      #     'question_property' => {
      #       'type' => 'Multiple Answers',
      #       'questionText' => 'Which of these are gulf countries',
      #       'choicesTexts' => ['UAE', 'KSA'],
      #       'randomization.type' => nil
      #     },
      #     'scoring' => { 'accountability' => nil, 'grit' => nil }
      #   }
      # ]
      def call
        headers = rows[0]
        sub_headers = rows[1]
        questions = rows[2..]

        processed_rows = questions.each_with_object([]) do |question_data, array|
          hash = {}
          question_data.each.with_index do |column_value, index|
            next if column_value.blank?

            header = headers[index]
            sub_header = sub_headers[index]
            sub_header = sub_header&.downcase if HEADERS_WHOSE_SUB_HEADER_CAN_BE_DOWNCASED.include?(header)
            next if header.blank? || sub_header.blank?

            Utility::Hash.set_nested_key(hash, "#{header.tr(' ', '_').downcase}.#{sub_header}", column_value)
          end
          array << hash
        end

        broadcast :ok, processed_rows
      end
    end
  end
end

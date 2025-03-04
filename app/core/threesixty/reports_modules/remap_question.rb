# frozen_string_literal: true

module Threesixty
  module ReportsModules
    class RemapQuestion < BaseCommand
      private_attr_reader :report, :questions_mapping

      def initialize(report, questions_mapping)
        @report = report
        @questions_mapping = questions_mapping
      end

      def call
        remap_single_question
      end

      private

      def remap_single_question
        report.modules.where("reports_modules.props ->> 'questionId' IS NOT NULL").find_each do |m|
          old_question_id = m.props['questionId']
          m.props['questionId'] = questions_mapping[old_question_id]
          m.save!
        end
        report.modules.where("reports_modules.props ->> 'questionsChoices' IS NOT NULL").find_each do |m|
          m.props['questionsChoices'] = m.props['questionsChoices'].map do |q|
            old_question_id = q['questionId']
            new_q_id = questions_mapping[old_question_id]
            { 'questionId' => new_q_id, 'choiceId' => q['choiceId'], 'choiceIds' => q['choiceIds'] }
          end
          m.save!
        end
        report.modules.where("reports_modules.props -> 'source' ->>  'id' IS NOT NULL").find_each do |m|
          next unless m.props['source']['type'] == 'Question'

          old_question_id = m.props['source']['id']
          new_q_id = questions_mapping[old_question_id]
          m.props['source']['id'] = new_q_id
          m.save!
        end
      end
    end
  end
end

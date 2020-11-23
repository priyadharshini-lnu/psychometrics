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
        report.modules.where("reports_modules.props ->> 'questionId' IS NOT NULL").each do |m|
          old_question_id = m.props['questionId']
          m.props['questionId'] = questions_mapping[old_question_id]
          m.save!
        end
      end
    end
  end
end

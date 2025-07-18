# frozen_string_literal: true

module Threesixty
  module PipedText
    class Perform < ::PipedText::BasePerform
      def self.branches
        [
          {
            key: 'c',
            name: 'campaign',
            class_name: 'Threesixty::PipedText::Branches::Campaign',
            required_context: %i[subject],
            allow_html: true
          },
          {
            key: 'u',
            name: 'user',
            class_name: 'Threesixty::PipedText::Branches::User',
            required_context: %i[user]
          },
          {
            key: 'p',
            name: 'recipient',
            class_name: 'Threesixty::PipedText::Branches::Recipient',
            required_context: %i[recipient threesixty_campaign]
          },
          {
            key: 'e',
            name: 'evaluator',
            class_name: 'Threesixty::PipedText::Branches::Evaluator',
            required_context: %i[evaluator]
          },
          {
            key: 's',
            name: 'subject',
            class_name: 'Threesixty::PipedText::Branches::Subject',
            required_context: %i[subject]
          },
          {
            key: 'st',
            name: 'subject_table',
            class_name: 'Threesixty::PipedText::Branches::SubjectTableBranch',
            required_context: %i[subject_ids evaluator threesixty_campaign],
            allow_html: true
          },
          {
            key: 'dash',
            name: 'dashboard',
            class_name: 'Threesixty::PipedText::Branches::Dashboard',
            required_context: %i[threesixty_campaign recipient],
            allow_html: true
          },
          {
            key: 'd',
            name: 'date',
            class_name: 'Threesixty::PipedText::Branches::DateTime',
            required_context: %i[subject],
            optional_context: %i[threesixty_campaign campaign]
          },
          {
            key: 'sst',
            name: 'subject_smart_text',
            class_name: 'Threesixty::PipedText::Branches::SubjectSmartText',
            required_context: %i[subject evaluator]
          },
          {
            key: 'answer',
            name: 'answer',
            class_name: 'Threesixty::PipedText::Branches::Answer',
            required_context: %i[result],
            allow_html: true
          },
          {
            key: 'nat',
            name: 'nomination_table',
            class_name: 'Threesixty::PipedText::Branches::NominationBranch',
            required_context: %i[subject threesixty_campaign],
            allow_html: true
          },
          {
            key: 'f',
            name: 'factor',
            class_name: 'Threesixty::PipedText::Branches::Factor',
            required_context: %i[assessment],
            allow_html: true
          },
          {
            key: 'skill_factor',
            name: 'skill_factor',
            class_name: 'Threesixty::PipedText::Branches::SkillFactor',
            required_context: %i[subject threesixty_campaign assessment],
            allow_html: true
          }
        ].freeze
      end
    end
  end
end

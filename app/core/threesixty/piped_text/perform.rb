# frozen_string_literal: true

module Threesixty
  module PipedText
    class Perform < BaseCommand
      BRANCHES = [
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
          required_context: %i[subject_ids evaluator threesixty_campaign]
        },
        {
          key: 'dash',
          name: 'dashboard',
          class_name: 'Threesixty::PipedText::Branches::Dashboard',
          required_context: %i[threesixty_campaign recipient]
        },
        {
          key: 'd',
          name: 'date',
          class_name: 'Threesixty::PipedText::Branches::DateTime',
          required_context: %i[subject threesixty_campaign]
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
          required_context: %i[result]
        },
        {
          key: 'nat',
          name: 'nomination_table',
          class_name: 'Threesixty::PipedText::Branches::NominationBranch',
          required_context: %i[subject threesixty_campaign]
        }
      ].freeze

      private_attr_reader :body, :context, :transformer

      def initialize(body, context = {}, transformer = nil)
        @body = body
        @context = context || {}
        @transformer = transformer
      end

      # rubocop:disable Style/CharacterLiteral
      def call
        return if body.blank?

        result =
          body.to_s.gsub(/{{(.*?)}}/) do
            match = Regexp.last_match(1)
            branch = lookup_branch(match)
            if valid_branch?(branch)
              path, params = match.scan(%r{//(.*)}).first&.first&.split('?')
              value = branch[:class_name].constantize.call!(
                path&.split('/'),
                Rack::Utils.parse_nested_query(params ? CGI.escape(params).gsub('%3D', ?=).gsub('%26', ?&) : ''),
                context
              )
              next transformer.call(value) if transformer

              value
            else
              ''
            end
          end
        broadcast :ok, result
      end
      # rubocop:enable Style/CharacterLiteral

      def lookup_branch(path)
        branch_key = path.scan(/^(\w+):/).first&.first
        return nil unless branch_key

        BRANCHES.find { |branch| branch[:key] == branch_key }
      end

      def valid_branch?(branch)
        return false unless branch

        branch[:required_context].all? { |key| context[key] }
      end
    end
  end
end

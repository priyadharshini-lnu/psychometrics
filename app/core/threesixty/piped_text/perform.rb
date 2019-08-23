# frozen_string_literal: true

module Threesixty
  module PipedText
    class Perform < BaseCommand
      BRANCHES = [
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
          required_context: %i[evaluator threesixty_campaign]
        },
        {
          key: 's',
          name: 'subject',
          class_name: 'Threesixty::PipedText::Branches::Subject',
          required_context: %i[subject threesixty_campaign]
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
          required_context: []
        }
      ].freeze

      def initialize(body, context = {})
        @body = body
        @context = context || {}
      end

      def call
        result =
          body.gsub /{{(.*?)}}/ do
            match = Regexp.last_match(1)
            branch = lookup_branch(match)
            if valid_branch?(branch)
              path, params = match.scan(%r{//(.*)}).first&.first&.split('?')
              branch[:class_name].constantize.call!(path&.split('/'), Rack::Utils.parse_nested_query(params ? URI.encode(params) : ''), context)
            else
              ''
            end
          end
        broadcast :ok, result
      end

      def lookup_branch(path)
        branch_key = path.scan(/^(\w+):/).first&.first
        return nil unless branch_key

        BRANCHES.find { |branch| branch[:key] == branch_key }
      end

      def valid_branch?(branch)
        return false unless branch

        branch[:required_context].all? { |key| context[key] }
      end

      private

      attr_reader :body, :context
    end
  end
end

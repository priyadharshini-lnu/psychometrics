# frozen_string_literal: true

module PipedText
  class BasePerform < BaseCommand
    include RegexEvaluator

    private_attr_reader :body, :context, :transformer

    def initialize(body, context = {}, transformer = nil)
      @body = body
      @context = context || {}
      @transformer = transformer
    end

    def call
      return broadcast :ok, '' if body.blank?

      result = body.to_s.dup
      process_piped_text(body, context, transformer) do |full_match, value|
        result.gsub!(full_match, value)
      end
      broadcast :ok, result
    end

    def lookup_branch(path)
      branch_key = path.scan(/^(\w+):/).first&.first
      return nil unless branch_key

      self.class.branches.find { |branch| branch[:key] == branch_key }
    end

    def valid_branch?(branch)
      return false unless branch

      branch[:required_context].all? { |key| context[key] }
    end

    def self.branches
      raise NotImplementedError
    end

    def self.piped_text_regex
      /{{(.*?)}}/
    end
  end
end

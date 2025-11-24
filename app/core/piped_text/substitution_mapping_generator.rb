# frozen_string_literal: true

module PipedText
  class SubstitutionMappingGenerator < BaseCommand
    include RegexEvaluator

    private_attr_reader :body, :context, :transformer

    def initialize(body, context = {}, transformer = nil)
      @body = body
      @context = context || {}
      @transformer = transformer
    end

    def call
      return broadcast :ok, {} if body.blank?

      piped_text_data = {}
      process_piped_text(body, context, transformer) do |full_match, value|
        piped_text_data[full_match] = value
      end
      broadcast :ok, piped_text_data
    end

    def lookup_branch(path)
      branch_key = path.scan(/^(\w+):/).first&.first
      return nil unless branch_key

      PipedText::BranchData.branches.find { |branch| branch[:key] == branch_key }
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

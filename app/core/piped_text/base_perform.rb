# frozen_string_literal: true

module PipedText
  class BasePerform < BaseCommand
    private_attr_reader :body, :context, :transformer

    def initialize(body, context = {}, transformer = nil)
      @body = body
      @context = context || {}
      @transformer = transformer
    end

    # rubocop:disable Style/CharacterLiteral, Metrics/PerceivedComplexity
    def call
      return if body.blank?

      result =
        body.to_s.gsub(self.class.piped_text_regex) do
          match = Regexp.last_match(1)
          branch = lookup_branch(match)
          if valid_branch?(branch)
            path, params = match.scan(%r{//(.*)}).first&.first&.split('?')
            value = branch[:class_name].constantize.call!(
              path&.split('/'),
              Rack::Utils.parse_nested_query(
                params ? CGI.escape(params).gsub('%3D', ?=).gsub('%26', ?&).gsub('&amp%3B', ?&) : ''
              ),
              context
            )
            value = if branch[:allow_html]
                      value
                    elsif value
                      CGI.escapeHTML(value.to_s)
                    else
                      ''
                    end

            next transformer.call(value) if transformer

            value
          else
            ''
          end
        end
      broadcast :ok, result
    end
    # rubocop:enable Style/CharacterLiteral, Metrics/PerceivedComplexity

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

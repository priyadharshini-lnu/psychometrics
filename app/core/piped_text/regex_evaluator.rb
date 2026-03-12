# frozen_string_literal: true

module PipedText
  module RegexEvaluator
    def process_piped_text(body, context, transformer)
      body.to_s.scan(self.class.piped_text_regex) do |_,|
        match = Regexp.last_match(1)
        full_match = Regexp.last_match(0)
        branch = lookup_branch(match)
        if valid_branch?(branch)
          path, params = match.scan(%r{//(.*)}).first&.first&.split('?')
          value = get_value_from_branch(branch, path, context, params)
          value = if branch[:allow_html]
                    value
                  elsif value
                    CGI.escapeHTML(value.to_s)
                  else
                    ''
                  end
          value = transformer.call(value) if transformer
          yield(full_match, value || '')
        else
          yield(full_match, full_match)
        end
      end
    end

    def get_value_from_branch(branch, path, context, params)
      branch[:class_name].constantize.call!(
        path&.split('/'),
        Rack::Utils.parse_nested_query(
          params ? CGI.escape(params).gsub('%3D', '=').
            gsub('%26', '&').gsub('&amp%3B', '&') : ''
        ),
        context
      )
    end
  end
end

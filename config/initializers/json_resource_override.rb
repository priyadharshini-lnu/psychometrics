# frozen_string_literal: true

module JSONAPI
  class IncludeDirectives
    alias_method :old_parse_include, :parse_include

    def parse_include(include)
      if @resource_klass.respond_to?(:unpermitted_includes)
        relation = include.split('.').first.to_sym
        return if @resource_klass.unpermitted_includes.include?(relation)
      end

      old_parse_include(include)
    end
  end
end

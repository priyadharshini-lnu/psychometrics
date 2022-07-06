# frozen_string_literal: true

module JSONAPI
  class IncludeDirectives
    alias old_parse_include parse_include

    def parse_include(include)
      if @resource_klass.respond_to?(:unpermitted_includes)
        relation = include.split('.').first.to_sym
        return if @resource_klass.unpermitted_includes.include?(relation)
      end

      old_parse_include(include)
    end
  end
end

module JSONAPI
  class ResponseDocument
    alias old_top_level_meta top_level_meta

    def top_level_meta
      @operation_results.has_errors? ? {} : old_top_level_meta
    end
  end
end

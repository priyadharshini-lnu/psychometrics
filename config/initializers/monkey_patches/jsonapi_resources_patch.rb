# frozen_string_literal: true

# Temporary monkey patch for Rails 7.2 compatibility with jsonapi-resources <= 0.9.12.
# In Rails 7.2, `ActiveSupport::Deprecation.warn` was removed as a class method,
# but jsonapi-resources still calls it directly, causing a NoMethodError.
#
# Remove this file once this issue is resolved:
# https://github.com/cerebris/jsonapi-resources/issues/1465

if ActiveSupport::Deprecation.respond_to?(:warn) == false
  module ActiveSupport
    class Deprecation
      class << self
        def warn(message = nil, callstack = nil)
          ActiveSupport::Deprecation.new.warn(message, callstack || caller_locations)
        end
      end
    end
  end
end

module JsonapiResourcesRails82Compatibility
  def jsonapi_resource(...)
    with_jsonapi_route_keywords { super }
  end

  def jsonapi_resources(...)
    with_jsonapi_route_keywords { super }
  end

  # rubocop:disable Style/SuperArguments
  def resource(*arguments, **options, &)
    options = route_options(arguments, options)
    super(*arguments, **options, &)
  end

  def resources(*arguments, **options, &)
    options = route_options(arguments, options)
    super(*arguments, **options, &)
  end
  # rubocop:enable Style/SuperArguments

  private

  def with_jsonapi_route_keywords
    @jsonapi_route_keywords = true
    yield
  ensure
    @jsonapi_route_keywords = false
  end

  def route_options(arguments, options)
    return options unless @jsonapi_route_keywords && options.empty? && arguments.last.is_a?(Hash)

    arguments.pop
  end
end

ActionDispatch::Routing::Mapper::Resources.prepend(JsonapiResourcesRails82Compatibility)

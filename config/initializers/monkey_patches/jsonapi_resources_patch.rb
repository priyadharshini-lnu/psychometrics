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

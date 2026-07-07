# frozen_string_literal: true

# Fix for https://github.com/rswag/rswag/issues/751 until rswag release new version with a fix

module RswagMiddlewareFix
  def call(*args)
    status, headers, body = super
    [status.to_i, headers.transform_keys(&:downcase), body]
  end
end

class Rswag::Ui::Middleware
  prepend RswagMiddlewareFix
end

class Rswag::Api::Middleware
  prepend RswagMiddlewareFix
end

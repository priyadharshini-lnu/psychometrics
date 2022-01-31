# frozen_string_literal: true

module Utility
  class Url
    def self.remove_query_params(url, params_to_remove)
      params_to_remove = ::Array.wrap(params_to_remove)
      uri = Addressable::URI.parse(url)
      params = uri.query_values
      uri.query_values = params.except(*params_to_remove).presence if params
      uri.to_s
    end
  end
end

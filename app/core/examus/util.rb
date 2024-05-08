# frozen_string_literal: true

module Examus
  module Util
    def api_client
      Faraday.new(base_api_url) do |connection|
        jwt = Examus::JwtTokenizer.encode(exp: 30.seconds.from_now.to_i)
        connection.headers['Content-Type'] = 'application/json'
        connection.headers['Authorization'] = "JWT #{jwt}"
      end
    end

    def base_api_url
      config = Settings.secrets.examus
      "#{config[:url]}/api/v2/integration/simple/#{config[:integration_name]}"
    end
  end
end

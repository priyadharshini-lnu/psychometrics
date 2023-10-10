# frozen_string_literal: true

module Support
  module Response
    def json_response
      JSON.parse(response.body).with_indifferent_access
    end
  end
end

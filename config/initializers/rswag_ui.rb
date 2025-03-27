# frozen_string_literal: true

Rswag::Ui.configure do |c|
  # List the Swagger endpoints that you want to be documented through the swagger-ui
  # The first parameter is the path (absolute or relative to the UI host) to the corresponding
  # JSON endpoint and the second is a title that will be displayed in the document selector
  # NOTE: If you're using rspec-api to expose Swagger files (under swagger_root) as JSON endpoints,
  # then the list below should correspond to the relative paths for those endpoints

  c.swagger_endpoint '/api-docs/v1/swagger.json', 'Lighthouse REST API v1'
  c.swagger_endpoint '/api-docs/v2/swagger.json', 'Lighthouse JSON API V2 Docs'
end

# Patch the CSP header to allow the RapiDoc to load
module Rswag
  module Ui
    class Middleware < Rack::Static
      def csp
        <<~POLICY.tr "\n", ' '
          default-src 'self';
          img-src 'self' data: *;
          font-src 'self' https://fonts.gstatic.com;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
          script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
        POLICY
      end
    end
  end
end

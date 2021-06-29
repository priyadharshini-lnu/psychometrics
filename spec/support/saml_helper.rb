# frozen_string_literal: true

module SamlHelper
  def build_saml_response(action, result = '')
    camalized_action = action.to_s.camelize
    response_tag = "#{camalized_action}Response"
    result_tag = "#{camalized_action}Result"

    %(
        <?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"
          xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <#{response_tag} xmlns="http://ws.sc-oasys.com/">
              <#{result_tag}>#{CGI.escapeHTML(result.squish)}</#{result_tag}>
            </#{response_tag}>
          </soap:Body>
        </soap:Envelope>
      )
  end
end

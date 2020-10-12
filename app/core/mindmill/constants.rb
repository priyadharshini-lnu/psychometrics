# frozen_string_literal: true

module Mindmill
  module Constants
    COMPANY_ID = 70
    KEY = ENV['MINDMILL_KEY']
    WSDL_URL = 'https://evo-api.mindmill.co.uk/ICAS/ICAS1.asmx?WSDL'
    AVAILABLE_LANGUAGES = %w[en ar fr].freeze
  end
end

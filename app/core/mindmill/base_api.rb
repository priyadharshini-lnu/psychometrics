# frozen_string_literal: true

module Mindmill
  class BaseApi < BaseCommand
    private

    def api
      @api ||= Savon.client(
        wsdl: Mindmill::Constants::WSDL_URL, soap_version: 2, log_level: :debug, logger: Rails.logger
      )
    end
  end
end

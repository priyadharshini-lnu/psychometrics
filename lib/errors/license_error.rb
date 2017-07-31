module Errors
  class LicenseError < StandardError
    attr_reader :client, :report

    def initialize(client, report, msg = nil)
      @client = client
      @report = report
      super(msg || default_message)
    end

    private
    def default_message
      "Client <strong>#{client.decorate.display_name}</strong> has not enough licenses for <strong>#{report.decorate.display_name}</strong> report.".html_safe
    end
  end
end

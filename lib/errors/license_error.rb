# frozen_string_literal: true

module Errors
  class LicenseError < StandardError
    attr_reader :client, :report, :user

    def initialize(client, report, user, msg = nil)
      @client = client
      @report = report
      @user = user

      super(msg || default_message)
    end

    private

    # rubocop:disable Metrics/LineLength
    def default_message
      "<b>#{user.decorate.display_name}</b> in <b>#{client.decorate.display_name}</b> has not enough licenses for <b>#{report.decorate.display_name}</b> report.".html_safe
    end
    # rubocop:enable Metrics/LineLength
  end
end

# frozen_string_literal: true

module Licenses
  class IsUsedByUser < BaseCommand
    private_attr_accessor :user, :report, :client

    def initialize(user, report)
      @user = user
      @client = user.tenancy
      @report = report
    end

    def call
      licenses = Licenses::FetchQuery.new(client, report).query

      broadcast :ok, user.license_usages.exists?(license_id: licenses.pluck(:id))
    end
  end
end

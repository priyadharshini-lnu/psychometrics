# frozen_string_literal: true

module Jwt
  class BuildAudience < BaseCommand
    private_attr_reader :application

    def initialize(application:)
      @application = application
    end

    def call
      return broadcast(:ok, nil) if application.blank?

      membership_client = application.memberships.first&.client
      return broadcast(:ok, nil) if membership_client.blank? || membership_client.subdomain.blank?

      broadcast(:ok, Utility::Url.generate(:root_url, subdomain: membership_client.subdomain).chomp('/'))
    end
  end
end

# frozen_string_literal: true

module Clients
  class CopyClient < BaseCommand
    def initialize(client)
      @client = client
    end

    def call
      clonned_client = client.deep_clone include: %i[clients_reports assessments_clients] do |original, copy|
        method_name = "clone_#{original.class.name.underscore}"
        public_send(method_name, original, copy) if respond_to?(method_name)
      end

      return broadcast(:invalid, clonned_client) unless clonned_client.save

      broadcast :ok, clonned_client
    end

    def clone_client(original, copy)
      copy.name += ' (copy)'
      if original.subdomain.present?
        copy.subdomain = original.subdomain + "_#{SecureRandom.random_number(Time.now.to_i)}"
      end
    end

    private

    attr_reader :client
  end
end

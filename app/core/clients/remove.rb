# frozen_string_literal: true

module Clients
  class Remove < BaseCommand
    private_attr_reader :client

    def initialize(client)
      @client = client
    end

    def call
      Client.transaction do
        client.projects.each do |project|
          ::Projects::Remove.call!(project)
        end
        client.destroy
        client.delete
      end
      Rails.logger.info "Client #{client.id} Deleted!"

      broadcast :ok
    end
  end
end

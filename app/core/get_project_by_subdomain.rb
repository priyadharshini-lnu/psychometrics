# frozen_string_literal: true

class GetProjectBySubdomain < BaseCommand
  private_attr_accessor :subdomain

  def initialize(subdomain)
    @subdomain = subdomain
  end

  def call
    return broadcast(:ok, nil) if subdomain.nil?

    project_subdomain = subdomain
    project_subdomain = subdomain.gsub(/\.{0,1}#{Settings.subdomain}/, '') if Settings.subdomain
    return broadcast(:ok, nil) if project_subdomain.nil?

    broadcast :ok, Client.enabled.find_by(subdomain: project_subdomain)
  end
end

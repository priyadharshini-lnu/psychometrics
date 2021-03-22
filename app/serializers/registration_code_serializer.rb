# frozen_string_literal: true

class RegistrationCodeSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers
  attributes :id, :code, :name, :total_count, :use_count, :start_date, :end_date, :disabled, :url,
             :restricted_domains

  def restricted_domains
    object.restricted_domains.join("\n")
  end

  def url
    new_user_registration_url(domain: Settings.domain, host: Settings.domain,
      subdomain: object.project.subdomain, code: object.code, port: Settings.port)
  end
end

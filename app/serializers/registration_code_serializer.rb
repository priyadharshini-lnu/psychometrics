# frozen_string_literal: true

class RegistrationCodeSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers
  attributes :id, :code, :name, :total_count, :use_count, :start_date, :end_date, :disabled, :url

  def url
    new_user_registration_url(domain: Settings.domain, host: Settings.domain,
      subdomain: object.project.subdomain, code: object.code)
  end
end

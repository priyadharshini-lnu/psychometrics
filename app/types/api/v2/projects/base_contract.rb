# frozen_string_literal: true

module Api
  module V2
    module Projects
      class BaseContract < Api::Base::Contract
        config.messages.namespace = :add_edit_project

        rule(data: { attributes: :subdomain }) do
          key.failure(:reserved_subdomain, { value: value }) unless Settings.reserved_subdomains.exclude?(value)
        end

        rule(data: { attributes: :subdomain }) do
          key.failure(:invalid_subdomain_format) if key? && !/^[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?$/.match?(value)
        end
      end
    end
  end
end

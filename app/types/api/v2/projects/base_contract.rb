# frozen_string_literal: true

module Api
  module V2
    module Projects
      class BaseContract < Api::Base::Contract
        config.messages.namespace = :add_edit_project

        rule(data: { attributes: :subdomain }) do
          unless Settings.reserved_subdomains.exclude?(value)
            key.failure(I18n.t('admin.subdomain_reserved',
                               value: value))
          end
        end

        rule(data: { attributes: :subdomain }) do
          if key? && !/^[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?$/.match?(value)
            key.failure(I18n.t('admin.subdomain_invalid_format'))
          end
        end

        rule(data: { attributes: :subdomain }) do
          if key? && ::Client::RESERVED_ADMIN_SUBDOMAIN_PATTERNS.any? { |pattern| pattern.match?(value) }
            key.failure(I18n.t('admin.subdomain_admin_keyword'))
          end
        end
      end
    end
  end
end

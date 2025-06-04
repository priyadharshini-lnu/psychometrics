# frozen_string_literal: true

module Administration
  module Projects
    module Integrations
      class IihtIntegrationSerializer < Panko::Serializer
        include Rails.application.routes.url_helpers

        attributes :user, :tenant_id, :tenancy_name, :webhook_url

        def webhook_url
          webhooks_iiht_url(
            host: Settings.domain,
            subdomain: Settings.subdomain,
            protocol: Settings.protocol,
            port: Settings.port,
            project_id: object.project_id
          )
        end

        def user
          object.config['user']
        end

        def tenant_id
          object.config['tenant_id']
        end

        def tenancy_name
          object.config['tenancy_name']
        end
      end
    end
  end
end

# frozen_string_literal: true

module Administration
  module Projects
    module Integrations
      class MettlIntegrationSerializer < Panko::Serializer
        include Rails.application.routes.url_helpers

        attributes :public_key, :private_key, :api_base_url, :completion_webhook_url, :results_webhook_url

        def public_key
          object.mettl_config['public_key']
        end

        def private_key
          object.mettl_config['private_key']
        end

        def api_base_url
          object.mettl_config['api_base_url']
        end

        def completion_webhook_url
          webhooks_mettl_completion_notification_url(
            host: Settings.domain,
            subdomain: Settings.subdomain,
            protocol: Settings.protocol,
            port: Settings.port,
            project_id: object.project_id
          )
        end

        def results_webhook_url
          webhooks_mettl_results_notification_url(
            host: Settings.domain,
            subdomain: Settings.subdomain,
            protocol: Settings.protocol,
            port: Settings.port,
            project_id: object.project_id
          )
        end
      end
    end
  end
end

# frozen_string_literal: true

module Administration
  module Projects
    class IntegrationSerializer < Panko::Serializer
      include Rails.application.routes.url_helpers

      attributes :id, :name, :active, :details, :user, :tenant_id, :tenancy_name

      def details
        if object.iiht?
          {
            webhook_url: webhooks_iiht_url(
              host: Settings.domain,
              subdomain: Settings.subdomain,
              protocol: Settings.protocol,
              port: Settings.port,
              project_id: object.project_id
            )
          }
        end
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

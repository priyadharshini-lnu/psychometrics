# frozen_string_literal: true

module Administration
  module Projects
    class IntegrationSerializer < Panko::Serializer
      include Rails.application.routes.url_helpers

      attributes :id, :name, :active, :details, :user, :tenant_id, :tenancy_name, :provider,
                 :private_key, :public_key

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

      def provider
        object.config['provider']
      end

      def public_key
        object.mettl_config['public_key']
      end

      def private_key
        object.mettl_config['private_key']
      end
    end
  end
end

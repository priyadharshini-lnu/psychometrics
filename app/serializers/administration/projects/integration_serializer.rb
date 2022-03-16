# frozen_string_literal: true

module Administration
  module Projects
    class IntegrationSerializer < ActiveModel::Serializer
      include Rails.application.routes.url_helpers

      attributes :id, :name, :active, :details

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

      def serializable_hash(*)
        super.merge(object.config.except('password'))
      end
    end
  end
end

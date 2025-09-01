# frozen_string_literal: true

module GeoFilterable
  extend ActiveSupport::Concern

  class_methods do
    def geo_scoped(country = Current.user_country)
      return all if Settings.features.disable_geo_restriction

      restricted_client_subquery = Client.restricted_clients(country).select(:id)
      scoped_by_client(restricted_client_subquery)
    end

    def scoped_by_client(_restricted_client_subquery)
      none # Safe default - models must implement their own logic
    end
  end
end

# frozen_string_literal: true

module Administration
  module Reports
    class GetExternalSettingsForm < Rectify::Command
      private_attr_reader :resource, :params

      def initialize(resource, params)
        @resource = resource
        @params = params
      end

      def call
        return unless resource_class

        form = resource_class.from_params(params || {})
        broadcast(:ok, form)
      end

      private

      def resource_class
        case resource.provider
          when 'hogan'
            Administration::Reports::ExternalSettings::HoganForm
          when 'saville'
            Administration::Reports::ExternalSettings::SavilleForm
          when 'mhs'
            Administration::Reports::ExternalSettings::MhsForm
        end
      end
    end
  end
end

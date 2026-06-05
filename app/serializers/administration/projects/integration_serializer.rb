# frozen_string_literal: true

module Administration
  module Projects
    class IntegrationSerializer < Panko::Serializer
      attributes :id, :name, :active, :iiht_integration_details,
                 :hogan_integration_details, :mettl_integration_details, :skillvue_integration_details,
                 :yoodli_integration_details, :microsite_integration_details

      def iiht_integration_details
        return nil unless object.iiht?

        Administration::Projects::Integrations::IihtIntegrationSerializer.new.serialize(
          object
        )
      end

      def hogan_integration_details
        return nil unless object.hogan?

        Administration::Projects::Integrations::HoganIntegrationSerializer.new.serialize(
          object
        )
      end

      def mettl_integration_details
        return nil unless object.mettl?

        Administration::Projects::Integrations::MettlIntegrationSerializer.new.serialize(
          object
        )
      end

      def skillvue_integration_details
        return nil unless object.skillvue?

        Administration::Projects::Integrations::SkillvueIntegrationSerializer.new.serialize(
          object
        )
      end

      def yoodli_integration_details
        return nil unless object.yoodli?

        Administration::Projects::Integrations::YoodliIntegrationSerializer.new.serialize(
          object
        )
      end

      def microsite_integration_details
        return nil unless object.microsite?

        Administration::Projects::Integrations::MicrositeIntegrationSerializer.new.serialize(
          object
        )
      end
    end
  end
end

# frozen_string_literal: true

module Administration
  module Assessments
    class GetExternalSettingsForm < Rectify::Command
      private_attr_reader :resource, :params

      def initialize(resource, params)
        @resource = resource
        @params = params
      end

      def call
        return unless resource_class

        form = resource_class.
               from_params(params || {}).
               with_context(assessment: resource)

        broadcast(:ok, form)
      end

      private

      def resource_class
        case resource.type
          when Assessment::TYPES[:hogan]
            Administration::Assessments::ExternalSettings::HoganForm
          when Assessment::TYPES[:pearson]
            Administration::Assessments::ExternalSettings::PearsonForm
          when Assessment::TYPES[:iiht]
            Administration::Assessments::ExternalSettings::IihtForm
          when Assessment::TYPES[:saville]
            Administration::Assessments::ExternalSettings::SavilleForm
          when Assessment::TYPES[:mhs]
            Administration::Assessments::ExternalSettings::MhsForm
        end
      end
    end
  end
end

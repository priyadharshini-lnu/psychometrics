# frozen_string_literal: true

module Campaigns
  module RegistrationCodes
    class Create < BaseCommand
      private_attr_reader :form, :campaign

      def initialize(form, campaign)
        @form = form
        @campaign = campaign
      end

      def call
        registration_code = campaign.registration_codes.create!(
          @form.attributes.merge(project_id: campaign.project.id)
        )

        broadcast(:ok, registration_code)
      end
    end
  end
end

# frozen_string_literal: true

module Threesixty
  module Campaigns
    class Build < BaseCommand
      private_attr_reader :form

      def initialize(form)
        @form = form
      end

      def call
        campaign = form.project.project_campaigns.build(name: form.name)
        campaign.type = ::Campaign::THREESIXTY

        threesixty_campaign = campaign.build_threesixty_campaign(form.attributes.slice(:factors, :assessment_id))
        threesixty_campaign.build_option(participants: Threesixty::Option::DEFAULT_PARTICIPANTS,
                                         reports: Threesixty::Option::DEFAULT_REPORTS)

        broadcast :ok, threesixty_campaign
      end
    end
  end
end

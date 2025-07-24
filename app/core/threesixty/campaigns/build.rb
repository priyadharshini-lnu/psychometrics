# frozen_string_literal: true

module Threesixty
  module Campaigns
    class Build < BaseCommand
      private_attr_reader :form, :project

      def initialize(form, project)
        @form = form
        @project = project
      end

      def call
        campaign = project.project_campaigns.build(name: form.name)
        campaign.type = ::Campaign::THREESIXTY
        campaign.status = form.status

        threesixty_campaign = campaign.build_threesixty_campaign
        threesixty_campaign.build_option(participants: Threesixty::Option::DEFAULT_PARTICIPANTS,
                                         reports: Threesixty::Option::DEFAULT_REPORTS)
        threesixty_campaign.category = form.threesixty_category || Threesixty::Campaign.categories[:normal]

        broadcast :ok, threesixty_campaign
      end
    end
  end
end

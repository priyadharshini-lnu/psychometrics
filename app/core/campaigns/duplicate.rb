# frozen_string_literal: true

module Campaigns
  class Duplicate < Rectify::Command
    attr_reader :form, :campaign

    def initialize(form, campaign)
      @form = form
      @campaign = campaign
    end

    def call
      return broadcast :invalid, form if form.invalid?

      duplicated_campaign = campaign.dup
      duplicated_campaign.update!(form.attributes)
      duplicated_campaign.clients_reports = campaign.clients_reports.
                                            map { |d|
        ClientsReport.new d.attributes.slice('report_id', 'report_family_id', 'user_access')
      }
      duplicated_campaign.assessments = campaign.assessments

      broadcast :ok, duplicated_campaign
    end
  end
end

# frozen_string_literal: true

module Campaigns
  class Copy < BaseCommand
    attr_reader :form, :campaign

    def initialize(form, campaign)
      @form = form
      @campaign = campaign
    end

    def call
      return broadcast :invalid, form if form.invalid?

      new_campaign = transaction do
        new_campaign = copy_campaign(@campaign)
        copy_sequencing(new_campaign)
        copy_assessments_and_reports(new_campaign)
        copy_datasheet_columns(new_campaign)
        new_campaign
      end

      broadcast :ok, new_campaign
    end

    def copy_campaign(campaign)
      campaign.dup.tap do |new_campaign|
        new_campaign.campaign_options = campaign.campaign_options.dup
        new_campaign.update!(form.attributes)
      end
    end

    def copy_assessments_and_reports(new_campaign)
      campaign.campaign_assessments.each do |ca|
        new_campaign.campaign_assessments << ca.dup
      end
      campaign.campaign_reports.each do |cr|
        new_campaign.campaign_reports << cr.dup
      end
      campaign.campaign_assessor_assessments.each do |caa|
        new_campaign.campaign_assessor_assessments << caa.dup
      end
    end

    def copy_sequencing(new_campaign)
      campaign.campaign_assessment_groups.each do |cag|
        new_cag = cag.dup
        new_cag.save!
        new_campaign.campaign_assessments.where(campaign_assessment_group_id: cag.id).
          update_all(campaign_assessment_group_id: new_cag.id)
        new_campaign.campaign_assessment_groups << new_cag
      end
    end

    def copy_datasheet_columns(new_campaign)
      return unless campaign.campaign_datasheet

      new_campaign.create_campaign_datasheet
      campaign.campaign_datasheet.sheet_columns.each do |column|
        new_campaign.datasheet.sheet_columns << column.dup
      end
    end
  end
end

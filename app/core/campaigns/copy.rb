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
        copy_assessments_and_reports(new_campaign)
        copy_sequencing(new_campaign)
        copy_datasheet_columns(new_campaign)
        if form.copy_campaign_factors
          copy_campaign_factors_and_groups(new_campaign)
        end

        if form.copy_campaign_ai_artifacts
          Copy::CampaignAIArtifacts.call!(campaign, new_campaign)
        end
        new_campaign
      end

      broadcast :ok, new_campaign
    end

    def copy_campaign(campaign)
      campaign.dup.tap do |new_campaign|
        new_campaign.campaign_options = campaign.campaign_options.dup
        attrs = form.attributes.except(:copy_campaign_factors, :copy_campaign_ai_artifacts)
        new_campaign.update!(attrs)
      end
    end

    def copy_assessments_and_reports(new_campaign)
      campaign.campaign_assessments.each do |ca|
        new_ca = ca.dup
        new_ca.skip_set_position = true
        new_campaign.campaign_assessments << new_ca
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
        copy_group_translations(cag, new_cag)
        new_campaign.campaign_assessments.where(campaign_assessment_group_id: cag.id).
          update_all(campaign_assessment_group_id: new_cag.id)
        new_campaign.campaign_assessor_assessments.where(campaign_assessment_group_id: cag.id).
          update_all(campaign_assessment_group_id: new_cag.id)
        new_campaign.campaign_assessment_groups << new_cag
      end
    end

    def copy_group_translations(source_group, target_group)
      source_group.translations.each do |translation|
        Mobility.with_locale(translation.locale) do
          target_group.name = translation.name
        end
      end
      target_group.save!
    end

    def copy_datasheet_columns(new_campaign)
      return unless campaign.campaign_datasheet

      new_campaign.create_campaign_datasheet
      campaign.campaign_datasheet.sheet_columns.each do |column|
        new_campaign.datasheet.sheet_columns << column.dup
      end
    end

    def copy_campaign_factors_and_groups(new_campaign)
      group_id_map = {}
      campaign.campaign_factor_groups.order(:position).each do |group|
        new_group = group.dup
        new_group.campaign_id = new_campaign.id
        new_group.save!
        group_id_map[group.id] = new_group.id
      end

      campaign.campaign_factors.order(:position).each do |factor|
        new_factor = factor.dup
        new_factor.campaign_id = new_campaign.id
        new_factor.campaign_factor_group_id = group_id_map[factor.campaign_factor_group_id]
        new_factor.save!
      end
    end
  end
end

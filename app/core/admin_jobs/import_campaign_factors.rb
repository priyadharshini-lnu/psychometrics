# frozen_string_literal: true

module AdminJobs
  class ImportCampaignFactors < AdminJobs::Base
    def call
      form = ::CampaignFactors::ImportForm.new(roo_excel: roo_excel).with_context(campaign: campaign)

      return broadcast :ok, { error_messages: form.errors.full_messages } unless form.valid?

      CampaignFactor.transaction do
        form.processed_rows.each do |row|
          campaign_factor_group = find_or_create_campaign_factor_group(row['campaign_factor_group_name'])
          create_campaign_factor(campaign_factor_group, row.except('campaign_factor_group_name'))
        end
      end

      broadcast :ok
    end

    def create_campaign_factor(campaign_factor_group, row)
      CampaignFactor.find_or_create_by(
        code: row['code'],
        campaign_id: campaign.id
      ) do |campaign_factor|
        campaign_factor.attributes = row.merge(
          campaign_factor_group_id: campaign_factor_group.id
        )
      end
    end

    def find_or_create_campaign_factor_group(campaign_factor_group_name)
      CampaignFactorGroup.find_or_create_by(
        name: campaign_factor_group_name || CampaignFactorGroup::DEFAULT_GROUP_NAME,
        campaign_id: campaign.id
      )
    end

    def valid?
      campaign.present?
    end

    private

    def roo_excel
      Roo::Excelx.new(record.file.url)
    end

    def campaign
      @campaign ||= Campaign.find_by(id: record.data['campaign_id'])
    end
  end
end

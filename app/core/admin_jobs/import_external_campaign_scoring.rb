# frozen_string_literal: true

module AdminJobs
  class ImportExternalCampaignScoring < AdminJobs::Base
    def call
      form = Campaigns::ExternalCampaignScoresImport::ImportForm.new(file: record.file).
             with_context(campaign: campaign)

      return broadcast :ok, { error_messages: form.errors.full_messages } unless form.valid?

      Campaign.transaction do
        form.processed_rows.each do |row|
          campaign_factor_ids = row['factor_values'].keys
          user_email = row['email']

          campaign_factors = campaign_factors_of(campaign_factor_ids)

          campaign_factors.each do |campaign_factor|
            find_or_create_campaign_factor_value(
              campaign_factor, user_email, row['factor_values'][campaign_factor.id]
            )
          end
        end
      end

      broadcast :ok
    end

    def valid?
      campaign.present?
    end

    private

    def campaign
      @campaign ||= Campaign.find_by(id: record.data['campaign_id'])
    end

    def campaign_factors_of(campaign_factor_ids)
      campaign.campaign_factors.external_score.where(id: campaign_factor_ids)
    end

    def find_or_create_campaign_factor_value(campaign_factor, email, value)
      user = User.find_by(email: email, project_id: campaign.project_id)
      return unless user

      campaign_factor.campaign_factor_values.find_or_initialize_by(user: user, campaign: campaign).tap do |cfv|
        cfv.value = campaign_factor.numeric_output_type? ? value.to_d : value.to_s
        cfv.save!
      end
    end
  end
end

# frozen_string_literal: true

module CampaignFactors
  class Export < BaseCommand
    private_attr_accessor :campaign

    ALLOWED_HEADERS = [
      'Position', 'Name', 'Code', 'Description', 'Factor Type', 'Output Type',
      'Factor Id', 'Assessment Id', 'Sheet Column Name', 'Assessment Score Type', 'Formula',
      'Ranked', 'Public Visibility', 'Campaign Factor Group Name'
    ].freeze

    def initialize(campaign)
      @campaign = campaign
    end

    def call
      results =
        Axlsx::Package.new do |package|
          package.workbook.add_worksheet(name: 'CampaignFactors') do |sheet|
            header_style = package.workbook.styles.add_style(b: true, sz: 14)

            sheet.add_row(ALLOWED_HEADERS, style: header_style)

            campaign_factors.each do |campaign_factor|
              sheet.add_row(campaign_factor_details(campaign_factor))
            end
          end
        end

      broadcast :ok, results
    end

    private

    def campaign_factor_details(campaign_factor)
      [
        campaign_factor.position,
        campaign_factor.name,
        campaign_factor.code,
        campaign_factor.description,
        campaign_factor.factor_type,
        campaign_factor.output_type,
        campaign_factor.factor_id,
        campaign_factor.assessment_id,
        campaign_factor.sheet_column_name,
        campaign_factor.assessment_score_type,
        campaign_factor.formula,
        campaign_factor.ranked,
        campaign_factor.public_visibility,
        campaign_factor.campaign_factor_group.name
      ]
    end

    def campaign_factors
      campaign.campaign_factor_groups.order(:position).includes(:campaign_factors).map do |group|
        group.campaign_factors.sort_by(&:position)
      end.flatten
    end
  end
end

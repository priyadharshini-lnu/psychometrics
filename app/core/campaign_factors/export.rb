# frozen_string_literal: true

module CampaignFactors
  class Export < BaseCommand
    private_attr_accessor :campaign

    ALLOWED_HEADERS = [
      'Position', 'Name', 'Code', 'Description', 'Factor Type', 'Output Type',
      'Factor Id', 'Assessment Id', 'Sheet Column Name', 'Assessment Score Type', 'Formula',
      'Ranked', 'Public Visibility', 'Campaign Factor Group Name', 'Min Value', 'Max Value', 'Is NA Allowed',
      'Disallow Lead Assessor Moderation'
    ].freeze

    def initialize(campaign)
      @campaign = campaign
    end

    def call
      package = ExcelSafe.new
      package.add_worksheet('CampaignFactors') do |sheet|
        header_style = sheet.workbook.styles.add_style(b: true, sz: 14)

        sheet.add_row(ALLOWED_HEADERS, style: header_style)

        campaign_factors.each do |campaign_factor|
          sheet.add_row(campaign_factor_details(campaign_factor))
        end
      end

      broadcast :ok, package
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
        campaign_factor.campaign_factor_group.name,
        campaign_factor.min_value,
        campaign_factor.max_value,
        campaign_factor.is_na_allowed,
        campaign_factor.disallow_lead_assessor_moderation
      ]
    end

    def campaign_factors
      campaign.campaign_factor_groups.order(:position).includes(:campaign_factors).map do |group|
        group.campaign_factors.sort_by(&:position)
      end.flatten
    end
  end
end

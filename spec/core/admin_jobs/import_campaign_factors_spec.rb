# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::ImportCampaignFactors do
  let(:campaign) { create(:campaign) }
  let(:project) { create(:project) }
  let(:dimension) { create(:dimension) }

  let(:job_record) do
    create(
      :admin_job_record, operation: :import_campaign_factors,
      data: { campaign_id: campaign.id }
    )
  end

  before do
    roo_excel = Roo::Excelx.new(Rails.root.join('spec/fixtures/files/import_campaign_factors/valid_file.xlsx'))
    allow_any_instance_of(AdminJobs::ImportCampaignFactors).to receive(:roo_excel).and_return(roo_excel)
  end

  it 'creates all factors' do
    described_class.call!(job_record)

    campaign.reload

    verify_generated_campaign_factor_groups
    verify_generated_campaign_factors
  end

  def verify_generated_campaign_factor_groups
    expect(campaign.campaign_factor_groups.count).to eq(1)

    campaign_factor_group = campaign.campaign_factor_groups.first

    expect(campaign_factor_group.name).to eq('Overall Scores')
    expect(campaign_factor_group.position).to eq(1)
  end

  def verify_generated_campaign_factors
    expect(campaign.campaign_factors.count).to eq(3)

    first_campaign_factor = campaign.campaign_factors.first

    expect(first_campaign_factor.name).to eq('Overall score')
    expect(first_campaign_factor.code).to eq('overall_score')
    expect(first_campaign_factor.factor_type).to eq('formula')
    expect(first_campaign_factor.output_type).to eq('numeric')
    expect(first_campaign_factor.assessment_score_type).to eq('norm_score')
    expect(first_campaign_factor.formula).to eq('return __overall_assessor_score + __overall_online_score')

    expect(first_campaign_factor.campaign_id).to eq(campaign.id)
    expect(first_campaign_factor.campaign_factor_group_id).to eq(campaign.campaign_factor_groups.first.id)
  end
end

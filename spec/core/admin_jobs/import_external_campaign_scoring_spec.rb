# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::ImportExternalCampaignScoring do
  let(:campaign) { create(:campaign) }
  let!(:user) { create(:user, email: 'user@example.com', project: campaign.project) }
  let!(:campaign_factor1) do
    create(:campaign_factor, factor_type: :external_score, code: 'ext_code1', campaign: campaign)
  end
  let!(:campaign_factor2) do
    create(:campaign_factor, factor_type: :external_score, code: 'ext_code2', campaign: campaign)
  end

  let(:job_record) do
    create(
      :admin_job_record, operation: :import_external_campaign_scoring,
      data: { campaign_id: campaign.id }
    )
  end

  before do
    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/import_external_campaign_scoring/valid_file.csv'),
      'text/csv'
    )
    allow(job_record).to receive(:file).and_return(file)
  end

  it 'creates campaign factor values for the specified campaign' do
    described_class.call!(job_record)

    campaign_factor_values = CampaignFactorValue.where(user: user, campaign: campaign)
    expect(campaign_factor_values.size).to eq(2)
    expect(campaign_factor_values.pluck(:campaign_factor_id)).to match_array([campaign_factor1.id, campaign_factor2.id])

    numeric_values = campaign_factor_values.map(&:numeric_value)

    expect(numeric_values).to contain_exactly(60, 71.8)
  end

  it 'sets calulcation type as manual' do
    described_class.call!(job_record)

    campaign_factor_values = CampaignFactorValue.where(user: user, campaign: campaign)

    expect(campaign_factor_values.first.calculation_type).to eq('manual')
    expect(campaign_factor_values.second.calculation_type).to eq('manual')
  end
end

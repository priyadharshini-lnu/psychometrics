# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::JoinCampaignByRegistrationCode do
  let!(:campaign) { create(:campaign) }
  let!(:current_user) { create(:user) }
  let!(:registration_code) { create(:registration_code, project: campaign.project, campaign: campaign, use_count: 0) }
  before(:each) do
    allow(Licenses::Use).to receive(:call!)
  end

  it "creates campaign user record if user doesn't exists in the project" do
    described_class.call!(current_user, campaign, registration_code)
    expect(campaign.campaign_users.exists?(user_id: current_user.id)).to be_truthy
    expect(registration_code.use_count).to eq(1)
  end

  it "doesn't create campaign user record if campaign user already exists in the project" do
    create(:campaign_user, campaign: campaign, user: current_user)
    expect do
      described_class.call!(current_user, campaign, registration_code)
    end.to_not(change { CampaignUser.count })
  end

  context 'add report and license usage' do
    let(:report) { create(:report) }
    let!(:campaign_reports) { create_list(:campaign_report, 2, report: report, campaign: campaign) }
    let(:report_family) { report.report_families.first }
    let!(:license) do
      create(
        :license,
        report_family: report_family,
        client: campaign.client,
        start_date: 2.days.ago,
        end_date: 2.days.since
      )
    end

    it 'call Campaigns::Users::AddReport for each campaign_report' do
      expect(Campaigns::Users::AddReport).to receive(:call!).twice

      described_class.call!(current_user, campaign, registration_code)
    end

    it 'broadcasts an error if there are not enough licenses' do
      allow(Licenses::Use).to receive(:call!).and_raise(Licenses::NotEnoughError)
      result = described_class.call(current_user, campaign, registration_code)
      expect(result).to eq({ error: I18n.t('licenses.not_enough_license_count') })
    end
  end

  it 'broadcasts an error if the user has already joined the campaign' do
    create(:campaign_user, campaign: campaign, user: current_user)
    result = described_class.call(current_user, campaign, registration_code)
    expect(result).to eq({ error: I18n.t('campaign.already_joined') })
  end

  it 'broadcasts an error if the registration code usage limit has been reached' do
    registration_code.update!(use_count: registration_code.total_count)
    result = described_class.call(current_user, campaign, registration_code)
    expect(result).to eq({ error: I18n.t('campaign.code_usage_limit_reached') })
  end

  it 'broadcasts :ok and the user if the operation is successful' do
    result = described_class.call(current_user, campaign, registration_code)
    expect(result).to eq({ ok: current_user })
  end

  it 'increments the registration code usage count' do
    expect do
      described_class.call(current_user, campaign, registration_code)
    end.to change { registration_code.reload.use_count }.by(1)
  end

  it 'creates an audit log entry' do
    expect(AuditLogModule).to receive(:audit!).with(
      :join_campaign, registration_code, user: current_user, campaign: campaign,
      payload: { code: registration_code.code }
    )
    described_class.call(current_user, campaign, registration_code)
  end
end

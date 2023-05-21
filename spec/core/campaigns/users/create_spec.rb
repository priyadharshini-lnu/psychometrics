# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::Create do
  let(:form) do
    Campaigns::Users::CreateForm.new(
      first_name: 'John', last_name: 'Doe', email: 'john@cc.com', operation: 'add_and_allow_new_response',
      schedule_start_date: 1.day.from_now, schedule_end_date: 2.days.from_now
    )
  end
  let!(:campaign) { create(:campaign) }
  let!(:current_user) { create(:user) }

  before(:each) do
    allow(Licenses::Use).to receive(:call!)
  end

  it "creates user record if user doesn't exists in the project" do
    expect do
      described_class.call!(form, campaign, current_user)
    end.to change { User.count }.by(1)
  end

  it "doesn't create user record if user already exists in the project" do
    create(:user, email: form.email, project_id: campaign.project_id)
    expect do
      described_class.call!(form, campaign, current_user)
    end.to_not(change { User.count })
  end

  it 'create campaign_user record' do
    user = described_class.call!(form, campaign, current_user)
    campaign_user = user.campaign_users.find_by(campaign: campaign)

    expect(campaign_user.schedule_start_date).to eq(1.day.from_now)
    expect(campaign_user.schedule_end_date).to eq(2.days.from_now)
    expect(campaign_user).to be_present
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

      described_class.call!(form, campaign, current_user)
    end

    it 'calls InvitationMailer if user are created through registration' do
      expect(InvitationMailer).to receive_message_chain(:invite, :deliver_later)

      described_class.call!(form, campaign)
    end
  end
end

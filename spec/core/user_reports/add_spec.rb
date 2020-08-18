# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::UserReports::Add do
  let(:campaign) { create(:campaign) }
  let(:campaign_user) do
    create(:campaign_user, campaign: campaign, user: create(:user, project_id: campaign.project_id))
  end
  let(:report) { create(:report) }
  let(:form) do
    Campaigns::UserReports::AddForm.new(report_ids: report.id, report_access: { report.id.to_s => true })
  end
  let(:report_family) { report.report_families.first }
  let(:license) do
    create(
      :license,
      report_family: report_family,
      client: campaign.client,
      start_date: 2.days.ago,
      end_date: 2.days.since
    )
  end

  it 'call Campaigns::Users::AddReport record for campaign_user with use_license flag as true' do
    form.operation = 'add_and_allow_new_response'

    expect(Campaigns::Users::AddReport).to receive(:call!).with(
      campaign_user,
      report,
      report_family_id: nil,
      user_access: true,
      operation: form.operation,
      use_license: true
    )

    described_class.call!(form, campaign_user)
  end

  it 'call Campaigns::Users::AddReport record for campaign_user with use_license flag as false' do
    create(:license_usage, license: license, user: campaign_user.user)
    form.operation = 'add_with_existing_response'

    expect(Campaigns::Users::AddReport).to receive(:call!).with(
      campaign_user,
      report,
      report_family_id: nil,
      user_access: true,
      operation: form.operation,
      use_license: false
    )

    described_class.call!(form, campaign_user)
  end

  it 'catches not enough license error error' do
    result = described_class.call(form, campaign_user)

    expect(result[:error][:base]).to eq("'#{campaign.client.name}' does not have enough licenses for '#{report.name}'")
  end
end

# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::UserReports::Add do
  let(:campaign) { create(:campaign) }
  let(:current_user) { create(:user) }
  let(:campaign_user) do
    create(:campaign_user, campaign: campaign, user: create(:user, project_id: campaign.project_id))
  end
  let(:report) { create(:report) }
  let(:report_family) { report.report_families.first }
  let(:form) do
    Campaigns::UserReports::AddForm.new(report_ids: report.id, report_family_id: report_family.id,
                                        report_access: { report.id.to_s => true })
  end
  let(:license) do
    create(
      :license,
      report_family: report_family,
      client: campaign.client,
      start_date: 2.days.ago,
      end_date: 2.days.since
    )
  end

  it 'catches not enough license error error' do
    result = described_class.call(form, campaign_user, current_user)

    expect(result[:insufficient_license][:base]).
      to eq("'#{campaign.client.name}' does not have enough licenses for '#{report.name}'")
  end
end

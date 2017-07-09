require 'rails_helper'

RSpec.describe AssignsReport, type: :model do
  let!(:membership) { create(:membership) }
  let!(:report) { create(:report) }
  let!(:assign) { create(:assign, membership: membership) }
  let!(:license) { create(:license, client: membership.client.root, used_number: 0, report_family: report.report_families.take) }

  it 'Increment license on create' do
    expect { create(:assigns_report, assign: assign, report: report) }.to change { license.reload.used_number }.by(1)
    expect(license.used_number).to eq(1)
  end
end

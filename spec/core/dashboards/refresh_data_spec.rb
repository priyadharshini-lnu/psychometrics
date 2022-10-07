# frozen_string_literal: true

require 'rails_helper'

describe Dashboards::RefreshData do
  let!(:dashboard) { create(:dashboard) }
  let!(:campaign) { dashboard.campaign }

  it "doesn't create view and calls powerbi for refresh if there is no datasheet" do
    expect(Sheets::CreateFlatSheetView).to_not receive(:call!)
    expect(PowerBi::RefreshDataset).to_not receive(:call!)

    described_class.call!(dashboard)
  end

  it 'calls command to create datasheet, accessheet view and refresh powerbi dataset' do
    datasheet = create(:datasheet, campaign: campaign)
    accesssheet = create(:accesssheet, campaign: campaign)

    campaign.reload

    expect(Sheets::CreateFlatSheetView).to receive(:call!).with(datasheet)
    expect(Sheets::CreateFlatSheetView).to receive(:call!).with(accesssheet)
    expect(PowerBi::RefreshDataset).to receive(:call!)

    described_class.call!(dashboard)

    expect(dashboard.reload.last_refreshed_at.utc).to be_within(1.second).of(Time.zone.now)
  end
end

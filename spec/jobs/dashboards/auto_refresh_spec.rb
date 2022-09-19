# frozen_string_literal: true

require 'rails_helper'

describe Dashboards::AutoRefresh do
  it 'calls Dashboards::RefreshData command for auto refreshable dashboard which needs refresh' do
    Timecop.return
    dashboard1 = create(:dashboard, dataset_id: nil)
    dashboard2 = create(:dashboard, dataset_id: '1', report_id: '1', refresh_interval: 15,
      refresh_tried_at: 10.minutes.ago)
    dashboard3 = create(:dashboard, dataset_id: '2', report_id: '2', refresh_interval: 15,
      refresh_tried_at: 16.minutes.ago)

    expect(Dashboards::IndividualDashboardRefreshJob).to_not receive(:perform_later).with(dashboard1)
    expect(Dashboards::IndividualDashboardRefreshJob).to_not receive(:perform_later).with(dashboard2)
    expect(Dashboards::IndividualDashboardRefreshJob).to receive(:perform_later).with(dashboard3)
    described_class.perform_now
  end
end

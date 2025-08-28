# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserReports::ScheduleReportAvailableNotificationJob, type: :job do
  let(:user_report_ids) { [user_report1.id, user_report2.id] }

  def notified_user_ids
    CommunicationEmail.joins(:communication, :communication_email_resources).
      where(communications: { kind: :report_available, campaign_id: campaign_id },
            communication_email_resources: { resource_type: 'UserReport',
                                             resource_id: user_report_ids }).
      pluck(:user_id)
  end
  let!(:campaign) { create(:campaign) }
  let!(:report) { create(:report) }
  let(:campaign_id) { campaign.id }
  let(:report_id) { report.id }
  let(:user1) { create(:user) }
  let(:user2) { create(:user) }
  let!(:user_report1) do
    create(:user_report, campaign_id: campaign_id, report_id: report_id, user_id: user1.id, user_access: true,
status: 'prepared')
  end
  let!(:user_report2) do
    create(:user_report, campaign_id: campaign_id, report_id: report_id, user_id: user2.id, user_access: true,
status: 'prepared')
  end

  it 'sends notification only to users who have not been notified for this report' do
    communication = create(:communication, kind: :report_available, campaign_id: campaign_id)
    CommunicationEmail.create_with_resources({ communication_id: communication.id, user_id: user1.id }, [user_report1])

    described_class.perform_now(campaign_id, report_id)
    expect(notified_user_ids).to match_array([user1.id, user2.id])
  end

  it 'does not send notification if all users already notified for this report' do
    communication = create(:communication, kind: :report_available, campaign_id: campaign_id)
    CommunicationEmail.create_with_resources({ communication_id: communication.id, user_id: user1.id }, [user_report1])
    CommunicationEmail.create_with_resources({ communication_id: communication.id, user_id: user2.id }, [user_report2])

    described_class.perform_now(campaign_id, report_id)
    expect(notified_user_ids).to match_array([user1.id, user2.id])
  end

  it 'does nothing if no user reports to notify' do
    UserReport.delete_all
    create(:communication, kind: :report_available, campaign_id: campaign_id)
    described_class.perform_now(campaign_id, report_id)
    expect(notified_user_ids).to be_empty
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserReports::ScheduleReportAvailableNotificationJob, type: :job do
  let!(:campaign) { create(:campaign) }
  let!(:report) { create(:report) }
  let(:user1) { create(:user) }
  let(:user2) { create(:user) }
  let(:user3) { create(:user) }

  describe '#perform' do
    context 'when user_report_ids array is empty' do
      it 'does not process any notifications' do
        expect_any_instance_of(UserReport).not_to receive(:schedule_report_available_notification)

        described_class.perform_now([])
      end
    end

    context 'when user_report_ids array has multiple user reports' do
      let!(:user_report1) do
        create(:user_report,
               campaign: campaign,
               report: report,
               user: user1,
               user_access: true,
               status: 'prepared')
      end

      let!(:user_report2) do
        create(:user_report,
               campaign: campaign,
               report: report,
               user: user2,
               user_access: false,
               status: 'prepared')
      end

      context 'when all user reports have user_access enabled' do
        it 'calls schedule_report_available_notification for all user reports' do
          user_report_ids = [user_report1.id]

          expect_any_instance_of(UserReport).to receive(:schedule_report_available_notification).once

          described_class.perform_now(user_report_ids)
        end
      end

      context 'when some user reports have user_access disabled' do
        it 'only calls schedule_report_available_notification for user reports with access' do
          user_report_ids = [user_report1.id, user_report2.id]

          expect_any_instance_of(UserReport).to receive(:schedule_report_available_notification).once

          described_class.perform_now(user_report_ids)
        end
      end

      context 'when all user reports have user_access disabled' do
        it 'does not call schedule_report_available_notification for any user report' do
          user_report4 = create(:user_report,
                                campaign: campaign,
                                report: report,
                                user: user3,
                                user_access: false,
                                status: 'prepared')

          user_report_ids = [user_report2.id, user_report4.id]

          expect_any_instance_of(UserReport).not_to receive(:schedule_report_available_notification)

          described_class.perform_now(user_report_ids)
        end
      end

      context 'when user_access is nil' do
        it 'does not call schedule_report_available_notification for user reports with nil access' do
          user_report2.update_column(:user_access, nil)
          user_report_ids = [user_report1.id, user_report2.id]

          expect_any_instance_of(UserReport).to receive(:schedule_report_available_notification).once

          described_class.perform_now(user_report_ids)
        end
      end
    end
  end
end

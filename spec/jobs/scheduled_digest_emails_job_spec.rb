# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ScheduledDigestEmailsJob, type: :job do
  include ActiveSupport::Testing::TimeHelpers

  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }

  describe '#perform (scoring approvals)' do
    let!(:setting) do
      create(:ai_scoring_approval_setting,
             campaign: campaign,
             assessment: assessment,
             send_digest_emails: true,
             digest_delivery_mode: 'scheduled',
             digest_frequency: 'daily',
             digest_time: Time.zone.parse('21:00'),
             digest_timezone: 'Asia/Calcutta',
             digest_emails_enabled_at: 1.day.ago,
             last_digest_sent_at: nil)
    end

    let(:base_utc_day) { Time.current.utc.beginning_of_day }
    let(:target_date) { base_utc_day + ((1 - base_utc_day.wday) % 7).days }
    let(:scheduled_check_time) { target_date + 15.hours + 35.minutes }

    context 'timezone handling' do
      it 'triggers digest when it is 9 PM in the configured timezone' do
        travel_to target_date + 15.hours + 32.minutes do
          expect(ScoreApprovals::DigestEmailSender).to receive(:send_for).with(setting)
          described_class.new.perform
        end
      end

      it 'does not trigger when it is 9 PM in a different timezone but not the configured one' do
        travel_to target_date + 17.hours + 2.minutes do
          expect(ScoreApprovals::DigestEmailSender).not_to receive(:send_for)
          described_class.new.perform
        end
      end

      it 'handles Asia/Dubai timezone correctly' do
        setting.update_columns(digest_timezone: 'Asia/Dubai')
        travel_to target_date + 17.hours + 5.minutes do
          expect(ScoreApprovals::DigestEmailSender).to receive(:send_for).with(setting)
          described_class.new.perform
        end
      end

      it 'handles UTC timezone' do
        setting.update_columns(digest_timezone: 'UTC')
        travel_to target_date + 21.hours + 5.minutes do
          expect(ScoreApprovals::DigestEmailSender).to receive(:send_for).with(setting)
          described_class.new.perform
        end
      end

      it 'compares last_digest_sent_at correctly across timezone boundaries' do
        setting.update_columns(
          last_digest_sent_at: target_date - 1.day + 15.hours + 30.minutes,
          digest_timezone: 'Asia/Calcutta'
        )

        travel_to target_date + 15.hours + 35.minutes do
          expect(ScoreApprovals::DigestEmailSender).to receive(:send_for).with(setting)
          described_class.new.perform
        end
      end
    end

    let(:current_weekday) { scheduled_check_time.in_time_zone('Asia/Calcutta').wday }
    let(:different_weekday) { (current_weekday + 1) % 7 }

    context '10-minute window' do
      it 'triggers within the first 10 minutes of digest_time' do
        travel_to target_date + 15.hours + 39.minutes do
          expect(ScoreApprovals::DigestEmailSender).to receive(:send_for).with(setting)
          described_class.new.perform
        end
      end

      it 'does not trigger after the 10-minute window' do
        travel_to target_date + 15.hours + 41.minutes do
          expect(ScoreApprovals::DigestEmailSender).not_to receive(:send_for)
          described_class.new.perform
        end
      end

      it 'does not trigger before digest_time' do
        travel_to target_date + 15.hours + 29.minutes do
          expect(ScoreApprovals::DigestEmailSender).not_to receive(:send_for)
          described_class.new.perform
        end
      end
    end

    context 'deduplication within same window' do
      it 'does not re-send if already sent in current window' do
        setting.update_columns(last_digest_sent_at: target_date + 15.hours + 33.minutes)

        travel_to target_date + 15.hours + 37.minutes do
          expect(ScoreApprovals::DigestEmailSender).not_to receive(:send_for)
          described_class.new.perform
        end
      end
    end

    context 'digest_frequency' do
      it 'triggers daily regardless of day' do
        travel_to (target_date - 1.day) + 15.hours + 35.minutes do
          expect(ScoreApprovals::DigestEmailSender).to receive(:send_for).with(setting)
          described_class.new.perform
        end
      end

      it 'triggers weekly only on configured weekday' do
        setting.update_columns(digest_frequency: 'weekly', digest_weekdays: [current_weekday])

        travel_to target_date + 15.hours + 35.minutes do
          expect(ScoreApprovals::DigestEmailSender).to receive(:send_for).with(setting)
          described_class.new.perform
        end
      end

      it 'does not trigger weekly on non-configured weekday' do
        setting.update_columns(digest_frequency: 'weekly', digest_weekdays: [different_weekday])

        travel_to target_date + 15.hours + 35.minutes do
          expect(ScoreApprovals::DigestEmailSender).not_to receive(:send_for)
          described_class.new.perform
        end
      end

      it 'triggers weekdays on configured days' do
        setting.update_columns(digest_frequency: 'weekdays', digest_weekdays: [1, 2, 3, 4, 5])

        travel_to target_date + 15.hours + 35.minutes do
          expect(ScoreApprovals::DigestEmailSender).to receive(:send_for).with(setting)
          described_class.new.perform
        end
      end

      it 'does not trigger weekdays on non-configured days' do
        non_configured = [1, 3, 4, 5] - [current_weekday]
        setting.update_columns(digest_frequency: 'weekdays', digest_weekdays: non_configured)

        travel_to target_date + 15.hours + 35.minutes do
          expect(ScoreApprovals::DigestEmailSender).not_to receive(:send_for)
          described_class.new.perform
        end
      end
    end

    context 'guard conditions' do
      it 'skips when digest_emails_enabled_at is blank' do
        setting.update_columns(digest_emails_enabled_at: nil)

        travel_to target_date + 15.hours + 35.minutes do
          expect(ScoreApprovals::DigestEmailSender).not_to receive(:send_for)
          described_class.new.perform
        end
      end

      it 'skips settings with digest_delivery_mode = immediate' do
        setting.update_columns(digest_delivery_mode: 'immediate')

        travel_to target_date + 15.hours + 35.minutes do
          expect(ScoreApprovals::DigestEmailSender).not_to receive(:send_for)
          described_class.new.perform
        end
      end

      it 'skips settings with send_digest_emails = false' do
        setting.update_columns(send_digest_emails: false)

        travel_to target_date + 15.hours + 35.minutes do
          expect(ScoreApprovals::DigestEmailSender).not_to receive(:send_for)
          described_class.new.perform
        end
      end
    end

    context 'timezone edge: day boundary difference' do
      it 'uses the correct day when timezone crosses midnight' do
        setting.update_columns(
          digest_time: Time.zone.parse('23:30'),
          digest_frequency: 'weekly',
          digest_weekdays: [current_weekday],
          digest_timezone: 'Asia/Calcutta'
        )

        travel_to target_date + 18.hours + 5.minutes do
          expect(ScoreApprovals::DigestEmailSender).to receive(:send_for).with(setting)
          described_class.new.perform
        end
      end

      it 'uses timezone day not UTC day for weekday check' do
        previous_day_weekday = (target_date + 18.hours + 37.minutes).in_time_zone('Asia/Calcutta').yesterday.wday

        setting.update_columns(
          digest_time: Time.zone.parse('00:05'),
          digest_frequency: 'weekly',
          digest_weekdays: [previous_day_weekday],
          digest_timezone: 'Asia/Calcutta'
        )

        travel_to target_date + 18.hours + 37.minutes do
          expect(ScoreApprovals::DigestEmailSender).not_to receive(:send_for)
          described_class.new.perform
        end
      end
    end
  end
end

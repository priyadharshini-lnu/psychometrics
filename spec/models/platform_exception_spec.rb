# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PlatformException, type: :model do
  let(:tracker) { create(:platform_exception) }
  let(:exception) { StandardError.new('Test exception') }
  let(:threshold) { 3 }
  let(:emails) { ['admin1@example.com', 'admin2@example.com'] }

  describe '#handle_exception!' do
    context 'when consecutive failure count reaches the threshold' do
      before do
        tracker.update!(consecutive_failure_count: threshold)
        allow(Settings).to receive(:platform_admins).and_return(emails.join(','))
      end

      it 'increments the failure count and saves the tracker' do
        expect { tracker.handle_exception!(exception, threshold) }.
          to change { tracker.reload.consecutive_failure_count }.by(1).
          and raise_error(SuppressedExceptionError)
      end

      it 'notifies the admins and raises a SuppressedExceptionError' do
        expect(tracker).to receive(:notify_admins!)
        expect { tracker.handle_exception!(exception, threshold) }.to raise_error(SuppressedExceptionError)
      end

      it 'sends notification and updates last_notified_at when last_notified_at is nil' do
        expect(tracker.last_notified_at).to be_nil
        expect(tracker).to receive(:notify_admins!).and_call_original
        expect do
          tracker.handle_exception!(exception, threshold)
        end.to have_enqueued_mail(
          PlatformExceptionMonitorMailer,
          :send_platform_exception_suppressed_notification
        ).with(emails, tracker).
          and change { tracker.reload.last_notified_at }.
          to(be_within(1.second).of(Time.zone.now)).
          and raise_error(SuppressedExceptionError)
      end

      it 'does not send notification if last_notified_at is less than DEFAULT_NOTIFICATION_COOLDOWN' do
        tracker.update!(last_notified_at: (PlatformException::DEFAULT_NOTIFICATION_COOLDOWN - 1.hour).ago)
        expect(tracker).not_to receive(:notify_admins!)
        expect { tracker.handle_exception!(exception, threshold) }.to raise_error(SuppressedExceptionError)
      end

      it 'sends notification if last_notified_at is more than default cooldown and updates last_notified_at' do
        tracker.update!(last_notified_at: (PlatformException::DEFAULT_NOTIFICATION_COOLDOWN + 1.hour).ago)

        expect(tracker).to receive(:notify_admins!).and_call_original
        expect do
          tracker.handle_exception!(exception, threshold)
        end.to have_enqueued_mail(
          PlatformExceptionMonitorMailer,
          :send_platform_exception_suppressed_notification
        ).with(emails, tracker).
          and change { tracker.reload.last_notified_at }.
          to(be_within(1.second).of(Time.zone.now)).
          and raise_error(SuppressedExceptionError)
      end
    end

    context 'when consecutive failure count is below the threshold' do
      before do
        tracker.update!(consecutive_failure_count: 1)
      end

      it 'increments the failure count and saves the tracker' do
        expect { tracker.handle_exception!(exception, threshold) }.
          to change { tracker.reload.consecutive_failure_count }.by(1).
          and raise_error(StandardError)
      end

      it 'saves exception details in meta' do
        expect { tracker.handle_exception!(exception, threshold) }.to raise_error(StandardError)
        expect(tracker.reload.meta).to include(
          'exception_class' => exception.class.name,
          'error_message' => exception.message,
          'backtrace' => nil
        )
      end

      it 'raises the original exception' do
        expect { tracker.handle_exception!(exception, threshold) }.to raise_error(StandardError)
      end
    end
  end

  describe '#reset_counter!' do
    it 'resets the consecutive failure count to 0' do
      tracker.update!(consecutive_failure_count: 5)
      tracker.reset_counter!
      expect(tracker.reload.consecutive_failure_count).to eq(0)
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Communications::Deliveries::DispatchJob, type: :job do
  # CommunicationDelivery#after_create_commit triggers Trigger, which itself enqueues this very job class.
  # Stub the bare `perform_later` (used by Trigger/TickJob) so creating fixtures below doesn't race a real
  # background dispatch against the explicit perform_now calls in these examples. This does not stub the
  # `.set(wait:).perform_later` chain used by #finalize_or_reschedule, which is asserted on directly.
  before do
    allow(Settings.features).to receive(:communication_center_enabled).and_return(true)
    allow(described_class).to receive(:perform_later)
    # Dispatch#call (invoked by #perform) also requires the per-client use_new_communication_center flag --
    # see Communications::Deliveries::Dispatch#rollout_active?.
    client.client_feature.update!(use_new_communication_center: true)
  end

  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:campaign) { create(:campaign, project: project) }

  let(:delivery) do
    create(:communication_delivery, client: client, project: project, campaign: campaign,
                                     recipients: :all, delivery_rule: :not_started,
                                     delivery_interval_number: 2, delivery_interval_period: 'days')
  end

  def create_active_campaign_user(completion_status: :not_started)
    user = create(:user, disabled: false)
    create(:campaign_user, campaign: campaign, user: user, active: true, completion_status: completion_status)
  end

  describe '#perform' do
    it 'reschedules the reminder with the correct wait duration' do
      create_active_campaign_user
      allow(described_class).to receive_message_chain(:set, :perform_later)

      described_class.perform_now(delivery.id)

      expect(described_class.set(wait: 2.days)).to have_received(:perform_later).with(delivery.id)
      expect(delivery.reload.status).to eq('active')
    end

    it 'reschedules using an hours interval when delivery_interval_period is hours' do
      delivery.update!(delivery_interval_number: 3, delivery_interval_period: 'hours')
      create_active_campaign_user
      allow(described_class).to receive_message_chain(:set, :perform_later)

      described_class.perform_now(delivery.id)

      expect(described_class.set(wait: 3.hours)).to have_received(:perform_later).with(delivery.id)
    end

    it 'reschedules using a months interval when delivery_interval_period is months' do
      delivery.update!(delivery_interval_number: 1, delivery_interval_period: 'months')
      create_active_campaign_user
      allow(described_class).to receive_message_chain(:set, :perform_later)

      described_class.perform_now(delivery.id)

      expect(described_class.set(wait: 1.month)).to have_received(:perform_later).with(delivery.id)
    end

    it 'marks the delivery completed instead of rescheduling once stop_reminder_datetime has passed' do
      delivery.update!(stop_reminder_datetime: 1.hour.ago)
      allow(described_class).to receive_message_chain(:set, :perform_later)

      described_class.perform_now(delivery.id)

      expect(delivery.reload.status).to eq('completed')
      expect(described_class).not_to have_received(:set)
    end

    it 'does not reschedule or finalize a delivery that was cancelled between ticks' do
      delivery.update!(status: :cancelled)
      allow(described_class).to receive_message_chain(:set, :perform_later)
      allow(Communications::Deliveries::Dispatch).to receive(:call)

      described_class.perform_now(delivery.id)

      expect(Communications::Deliveries::Dispatch).not_to have_received(:call)
      expect(described_class).not_to have_received(:set)
      expect(delivery.reload.status).to eq('cancelled')
    end

    context 'kind: assessment_center_booking_summary' do
      it 'reschedules to the next scheduled date instead of a fixed interval' do
        allow(described_class).to receive_message_chain(:set, :perform_later)
        booking_summary_delivery = create(:communication_delivery, :assessment_center_booking_summary,
                                          client: client, project: project, campaign: campaign)

        described_class.perform_now(booking_summary_delivery.id)

        expected_run_at = Communications::Deliveries::RecurringScheduling.
                          run_at_for(booking_summary_delivery, Date.current + 1.day)
        expect(described_class).to have_received(:set).with(wait_until: expected_run_at)
      end

      it 'marks the delivery completed once today is the last occurrence in the window' do
        allow(described_class).to receive_message_chain(:set, :perform_later)
        booking_summary_delivery = create(:communication_delivery, :assessment_center_booking_summary,
                                          client: client, project: project, campaign: campaign,
                                          delivery_end_date: Date.current)

        described_class.perform_now(booking_summary_delivery.id)

        expect(booking_summary_delivery.reload.status).to eq('completed')
        expect(described_class).to have_received(:set).once # only the initial schedule at creation, no reschedule
      end
    end
  end
end

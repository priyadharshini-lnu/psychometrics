# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Communications::Deliveries::TickJob, type: :job do
  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:campaign) { create(:campaign, project: project) }

  # specific_datetime deliveries only reach :enqueued via Trigger#call (no perform_later enqueue at creation
  # time), so no stubbing is required for the fixtures created below before we start counting invocations.
  def build_delivery(delivery_at:, status: :enqueued, last_ran_at: nil)
    delivery = create(:communication_delivery, client: client, project: project, campaign: campaign,
                                                 recipients: :all, delivery_rule: :specific_datetime,
                                                 delivery_at: delivery_at)
    delivery.update_columns(status: status, last_ran_at: last_ran_at)
    delivery
  end

  describe '#perform' do
    it 'enqueues dispatch only for due specific_datetime deliveries that are not cancelled or failed' do
      due_delivery = build_delivery(delivery_at: 1.hour.ago)
      future_delivery = build_delivery(delivery_at: 1.hour.from_now)
      cancelled_delivery = build_delivery(delivery_at: 1.hour.ago, status: :cancelled)
      failed_delivery = build_delivery(delivery_at: 1.hour.ago, status: :failed)

      allow(Communications::Deliveries::DispatchJob).to receive(:perform_later)

      described_class.perform_now

      expect(Communications::Deliveries::DispatchJob).to have_received(:perform_later).with(due_delivery.id).once
      expect(Communications::Deliveries::DispatchJob).not_to have_received(:perform_later).with(future_delivery.id)
      expect(Communications::Deliveries::DispatchJob).not_to have_received(:perform_later).with(cancelled_delivery.id)
      expect(Communications::Deliveries::DispatchJob).not_to have_received(:perform_later).with(failed_delivery.id)
    end

    it 'ignores deliveries that have already been dispatched (last_ran_at present)' do
      build_delivery(delivery_at: 1.hour.ago, last_ran_at: 1.minute.ago)

      allow(Communications::Deliveries::DispatchJob).to receive(:perform_later)

      described_class.perform_now

      expect(Communications::Deliveries::DispatchJob).not_to have_received(:perform_later)
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Communications::Deliveries::Dispatch do
  # CommunicationDelivery#after_create_commit triggers Communications::Deliveries::Trigger, which for
  # send_now/reminder rules enqueues Communications::Deliveries::DispatchJob. The test env's ActiveJob adapter
  # is :async, so an unstubbed enqueue would race a real background dispatch against the explicit
  # described_class.call(delivery) below. Stub it so these specs stay deterministic.
  before do
    allow(Settings.features).to receive(:communication_center_enabled).and_return(true)
    allow(Communications::Deliveries::DispatchJob).to receive(:perform_later)
    configured_job = instance_double(ActiveJob::ConfiguredJob, perform_later: true)
    allow(Communications::Deliveries::DispatchJob).to receive(:set).and_return(configured_job)
    # Dispatch#call also requires the per-client use_new_communication_center flag (see #rollout_active?) --
    # enabled by default here so the rest of this file can focus on dispatch mechanics; the flag-disabled
    # case gets its own dedicated example below.
    client.client_feature.update!(use_new_communication_center: true)
  end

  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:campaign) { create(:campaign, project: project) }

  let(:delivery) do
    create(:communication_delivery, client: client, project: project, campaign: campaign,
                                     recipients: :all, delivery_rule: delivery_rule)
  end

  let(:delivery_rule) { :send_now }

  def create_active_campaign_user(completion_status: :not_started)
    user = create(:user, disabled: false)
    create(:campaign_user, campaign: campaign, user: user, active: true, completion_status: completion_status)
  end

  describe 'send_now' do
    let(:delivery_rule) { :send_now }

    it 'creates one email per active campaign user and claims the occurrence' do
      campaign_user_one = create_active_campaign_user
      campaign_user_two = create_active_campaign_user

      expect do
        described_class.call(delivery)
      end.to change(CommunicationEmail, :count).by(2)

      expect(delivery.reload.last_ran_at).to be_present
      expect(CommunicationEmail.where(communication_delivery: delivery).pluck(:user_id)).
        to contain_exactly(campaign_user_one.user_id, campaign_user_two.user_id)
    end

    it 'only dispatches once for a one-shot delivery' do
      create_active_campaign_user

      first_result = described_class.call(delivery)
      expect(first_result[:ok]).to eq(delivery)

      expect do
        second_result = described_class.call(delivery.reload)
        expect(second_result.key?(:not_due)).to be true
      end.not_to change(CommunicationEmail, :count)
    end
  end

  describe 'reminder delivery_rule: not_started' do
    let(:delivery_rule) { :not_started }

    it 'creates emails only for not_started campaign users' do
      not_started_campaign_user = create_active_campaign_user(completion_status: :not_started)
      create_active_campaign_user(completion_status: :in_progress)
      create_active_campaign_user(completion_status: :completed)

      expect do
        described_class.call(delivery)
      end.to change(CommunicationEmail, :count).by(1)

      expect(CommunicationEmail.where(communication_delivery: delivery).pluck(:user_id)).
        to contain_exactly(not_started_campaign_user.user_id)
    end
  end

  describe 'mid-loop crash recovery' do
    let(:delivery_rule) { :send_now }

    it 'creates only the missing emails on retry without duplicating existing ones' do
      campaign_user_one = create_active_campaign_user
      campaign_user_two = create_active_campaign_user
      delivery # trigger creation now

      # Simulate a crash partway through the dispatch loop: one email already exists for
      # campaign_user_one (as if a prior, interrupted run got that far), carrying the same
      # occurrence_key a real dispatch would use ('once', for a one-shot delivery), but
      # last_ran_at was never persisted because the process died before the command finished.
      # The (delivery, user, occurrence_key) unique index -- not a time-window heuristic -- is
      # what prevents the retry below from creating a duplicate for campaign_user_one.
      CommunicationEmail.create!(communication_delivery: delivery, campaign_user: campaign_user_one,
                                 user: campaign_user_one.user, occurrence_key: 'once')
      expect(delivery.reload.last_ran_at).to be_nil

      expect do
        result = described_class.call(delivery)
        expect(result[:ok]).to eq(delivery)
      end.to change(CommunicationEmail, :count).by(1)

      expect(CommunicationEmail.where(communication_delivery: delivery).pluck(:user_id)).
        to contain_exactly(campaign_user_one.user_id, campaign_user_two.user_id)
      expect(delivery.reload.last_ran_at).to be_present
    end
  end

  describe 'terminal deliveries' do
    let(:delivery_rule) { :send_now }

    it 'does not dispatch a cancelled delivery' do
      delivery.update!(status: :cancelled)

      result = described_class.call(delivery)

      expect(result[:already_terminal]).to eq(delivery)
    end

    it 'does not dispatch a completed delivery' do
      delivery.update!(status: :completed)

      result = described_class.call(delivery)

      expect(result[:already_terminal]).to eq(delivery)
    end
  end

  describe 'feature flags' do
    let(:delivery_rule) { :send_now }

    it 'does not dispatch when the global communication_center_enabled setting is off' do
      allow(Settings.features).to receive(:communication_center_enabled).and_return(false)

      result = described_class.call(delivery)

      expect(result[:feature_disabled]).to eq(delivery)
    end

    it 'does not dispatch when the per-client use_new_communication_center flag is off' do
      client.client_feature.update!(use_new_communication_center: false)

      result = described_class.call(delivery)

      expect(result[:feature_disabled]).to eq(delivery)
    end
  end

  describe 'kind: workshop_invite_reminder' do
    let(:delivery) do
      create(:communication_delivery, :workshop_invite_reminder, client: client, project: project, campaign: campaign)
    end

    it 'self-reschedules on the configured interval like a reminder' do
      described_class.call(delivery)

      expect(delivery.reload.next_run_at).to be_within(1.second).of(1.day.from_now)
    end
  end

  describe 'delivery_interval_period widening to hours/months' do
    let(:delivery_rule) { :not_started }

    it 'reschedules using hours when delivery_interval_period is hours' do
      delivery.update!(delivery_interval_number: 3, delivery_interval_period: 'hours')

      described_class.call(delivery)

      expect(delivery.reload.next_run_at).to be_within(1.second).of(3.hours.from_now)
    end

    it 'reschedules using months when delivery_interval_period is months' do
      delivery.update!(delivery_interval_number: 2, delivery_interval_period: 'months')

      described_class.call(delivery)

      expect(delivery.reload.next_run_at).to be_within(1.second).of(2.months.from_now)
    end
  end

  describe 'kind: assessment_center_booking_summary' do
    let(:delivery) do
      create(:communication_delivery, :assessment_center_booking_summary, client: client, project: project,
                                                                            campaign: campaign)
    end

    it 'dispatches to the explicitly selected users once the scheduled occurrence is due' do
      user = create(:user, disabled: false)
      campaign_user = create(:campaign_user, campaign: campaign, user: user, active: true)
      create(:communication_delivery_user, communication_delivery: delivery, user: user)

      expect do
        described_class.call(delivery)
      end.to change(CommunicationEmail, :count).by(1)

      expect(CommunicationEmail.where(communication_delivery: delivery).pluck(:user_id)).
        to contain_exactly(campaign_user.user_id)
      expect(delivery.reload.last_ran_at).to be_present
    end

    context 'when the next scheduled occurrence has not arrived yet' do
      let(:delivery) do
        create(:communication_delivery, :assessment_center_booking_summary, client: client, project: project,
                                                                              campaign: campaign,
                                                                              delivery_start_date: Date.current + 1.day)
      end

      it 'broadcasts :not_due and does not dispatch' do
        expect do
          result = described_class.call(delivery)
          expect(result.key?(:not_due)).to be true
        end.not_to change(CommunicationEmail, :count)
      end
    end

    context 'once the last occurrence in the window has already run' do
      it 'broadcasts :not_due since there is no remaining occurrence to claim' do
        delivery.update_columns(last_ran_at: delivery.delivery_end_date, next_run_at: nil)

        result = described_class.call(delivery)

        expect(result.key?(:not_due)).to be true
      end
    end
  end

  describe 'unsupported recipients' do
    let(:delivery) do
      create(:communication_delivery, client: client, project: project, campaign: campaign,
                                       recipients: :new_users, delivery_rule: :send_now)
    end

    it 'marks the delivery failed and broadcasts :unsupported_recipients' do
      result = described_class.call(delivery)

      expect(result[:unsupported_recipients]).to eq(delivery)
      expect(delivery.reload.status).to eq('failed')
    end
  end
end

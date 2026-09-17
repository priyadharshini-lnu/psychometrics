# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Communications::Deliveries::ResolveAudience do
  # CommunicationDelivery#after_create_commit triggers Trigger, which enqueues DispatchJob for
  # send_now/reminder rules. Stub it so factory-created deliveries in this spec never kick off a real
  # (ActiveJob :async) background dispatch alongside the assertions below.
  before do
    allow(Communications::Deliveries::DispatchJob).to receive(:perform_later)
  end

  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:campaign) { create(:campaign, project: project) }

  let(:delivery) do
    create(:communication_delivery, client: client, project: project, campaign: campaign,
                                     recipients: recipients, delivery_rule: delivery_rule)
  end

  let(:recipients) { :all }
  let(:delivery_rule) { :send_now }

  describe 'recipients: all' do
    let(:recipients) { :all }

    it 'returns active campaign users with non-disabled users' do
      active_user = create(:user, disabled: false)
      active_campaign_user = create(:campaign_user, campaign: campaign, user: active_user, active: true)

      disabled_user = create(:user, disabled: true)
      create(:campaign_user, campaign: campaign, user: disabled_user, active: true)

      inactive_campaign_user_user = create(:user, disabled: false)
      create(:campaign_user, campaign: campaign, user: inactive_campaign_user_user, active: false)

      anonymous_user = create(:user, disabled: false, is_anonym: true)
      create(:campaign_user, campaign: campaign, user: anonymous_user, active: true)

      result = described_class.call(delivery)

      expect(result[:ok]).to contain_exactly(active_campaign_user)
    end
  end

  describe 'recipients: selected' do
    let(:recipients) { :selected }

    it 'returns only the selected users, scoped to the active campaign users' do
      selected_user = create(:user, disabled: false)
      selected_campaign_user = create(:campaign_user, campaign: campaign, user: selected_user, active: true)
      create(:communication_delivery_user, communication_delivery: delivery, user: selected_user)

      not_selected_user = create(:user, disabled: false)
      create(:campaign_user, campaign: campaign, user: not_selected_user, active: true)

      result = described_class.call(delivery)

      expect(result[:ok]).to contain_exactly(selected_campaign_user)
    end
  end

  describe 'reminder rules' do
    let(:recipients) { :all }

    let!(:not_started_campaign_user) do
      create(:campaign_user, campaign: campaign, user: create(:user, disabled: false), active: true,
                              completion_status: :not_started)
    end
    let!(:in_progress_campaign_user) do
      create(:campaign_user, campaign: campaign, user: create(:user, disabled: false), active: true,
                              completion_status: :in_progress)
    end
    let!(:completed_campaign_user) do
      create(:campaign_user, campaign: campaign, user: create(:user, disabled: false), active: true,
                              completion_status: :completed)
    end

    context 'delivery_rule: not_started' do
      let(:delivery_rule) { :not_started }

      it 'returns only campaign users who have not started' do
        result = described_class.call(delivery)

        expect(result[:ok]).to contain_exactly(not_started_campaign_user)
      end
    end

    context 'delivery_rule: not_completed' do
      let(:delivery_rule) { :not_completed }

      it 'returns campaign users who have not completed' do
        result = described_class.call(delivery)

        expect(result[:ok]).to contain_exactly(not_started_campaign_user, in_progress_campaign_user)
      end

      context 'with selected assessments' do
        it 'excludes only users who have deemed-completed every selected assessment' do
          assessment_one = create(:assessment)
          assessment_two = create(:assessment)
          create(:campaign_assessment, campaign: campaign, assessment: assessment_one)
          create(:campaign_assessment, campaign: campaign, assessment: assessment_two)
          create(:communication_delivery_assessment, communication_delivery: delivery, assessment: assessment_one)
          create(:communication_delivery_assessment, communication_delivery: delivery, assessment: assessment_two)

          finished_both_user = create(:user, disabled: false)
          finished_both_campaign_user = create(:campaign_user, campaign: campaign, user: finished_both_user,
                                                                 active: true, completion_status: :completed)
          create(:user_assessment, campaign: campaign, assessment: assessment_one, subject: finished_both_user,
                                    evaluator: finished_both_user, status: 'completed')
          create(:user_assessment, campaign: campaign, assessment: assessment_two, subject: finished_both_user,
                                    evaluator: finished_both_user, status: 'timed_out')

          finished_one_user = create(:user, disabled: false)
          finished_one_campaign_user = create(:campaign_user, campaign: campaign, user: finished_one_user,
                                                                active: true, completion_status: :in_progress)
          create(:user_assessment, campaign: campaign, assessment: assessment_one, subject: finished_one_user,
                                    evaluator: finished_one_user, status: 'completed')

          result = described_class.call(delivery)

          expect(result[:ok]).to include(finished_one_campaign_user, not_started_campaign_user,
                                         in_progress_campaign_user)
          expect(result[:ok]).not_to include(finished_both_campaign_user)
        end
      end
    end

    context 'delivery_rule: in_progress' do
      let(:delivery_rule) { :in_progress }

      it 'returns only campaign users who are in progress' do
        result = described_class.call(delivery)

        expect(result[:ok]).to contain_exactly(in_progress_campaign_user)
      end
    end
  end

  describe 'unsupported recipients' do
    context 'recipients: new_users' do
      let(:recipients) { :new_users }

      it 'broadcasts :unsupported_recipients instead of an empty scope' do
        result = described_class.call(delivery)

        expect(result.key?(:unsupported_recipients)).to be true
        expect(result.key?(:ok)).to be false
      end
    end
  end

  describe 'recipients: new_assignment' do
    let(:recipients) { :new_assignment }

    it 'returns only campaign users with a new self-assessment created after the cutoff' do
      recent_user = create(:user, disabled: false)
      recent_campaign_user = create(:campaign_user, campaign: campaign, user: recent_user, active: true)
      create(:user_assessment, campaign: campaign, subject: recent_user, evaluator: recent_user,
                                created_at: 1.minute.from_now)

      stale_user = create(:user, disabled: false)
      create(:campaign_user, campaign: campaign, user: stale_user, active: true)
      create(:user_assessment, campaign: campaign, subject: stale_user, evaluator: stale_user,
                                created_at: delivery.created_at - 1.day)

      other_assessor_user = create(:user, disabled: false)
      create(:campaign_user, campaign: campaign, user: other_assessor_user, active: true)
      create(:user_assessment, campaign: campaign, subject: create(:user), evaluator: other_assessor_user,
                                created_at: 1.minute.from_now)

      result = described_class.call(delivery)

      expect(result[:ok]).to contain_exactly(recent_campaign_user)
    end
  end

  describe 'kind: workshop_invite_reminder' do
    # The seat/lead-time filter compares against the database's own NOW(), which Timecop's Ruby-level
    # freeze (see rails_helper) cannot affect -- unfreeze so `start_time` computed in Ruby lines up with
    # what the SQL condition actually evaluates against. Same fix as
    # spec/jobs/communications/workshop_invite_reminder_job_spec.rb.
    before { Timecop.return }

    let(:delivery) do
      create(:communication_delivery, :workshop_invite_reminder, client: client, project: project, campaign: campaign)
    end

    def create_pending_subject(user:, group:, seats: { total: 10, booked: 0 }, start_time: 10.days.from_now,
                               scheduling_lead_time: 0)
      workshop = create(:workshop, campaign: campaign, campaign_assessment_group: group,
                                    total_seats: seats[:total], booked_seats: seats[:booked],
                                    start_time: start_time, scheduling_lead_time: scheduling_lead_time)
      workshop_invite = create(:workshop_invite, campaign: campaign, campaign_assessment_group: group,
                                                   workshops: [workshop])
      create(:workshop_invited_subject, workshop_invite: workshop_invite, user: user, status: 'pending')
    end

    it 'returns only campaign users with a pending invite to a workshop with seats and lead time available' do
      eligible_user = create(:user, disabled: false)
      eligible_campaign_user = create(:campaign_user, campaign: campaign, user: eligible_user, active: true)
      create_pending_subject(user: eligible_user, group: delivery.campaign_assessment_group)

      full_workshop_user = create(:user, disabled: false)
      create(:campaign_user, campaign: campaign, user: full_workshop_user, active: true)
      create_pending_subject(user: full_workshop_user, group: delivery.campaign_assessment_group,
                             seats: { total: 5, booked: 5 })

      past_lead_time_user = create(:user, disabled: false)
      create(:campaign_user, campaign: campaign, user: past_lead_time_user, active: true)
      create_pending_subject(user: past_lead_time_user, group: delivery.campaign_assessment_group,
                             start_time: 1.hour.from_now, scheduling_lead_time: 0)

      other_group_user = create(:user, disabled: false)
      create(:campaign_user, campaign: campaign, user: other_group_user, active: true)
      create_pending_subject(user: other_group_user, group: create(:campaign_assessment_group, campaign: campaign))

      result = described_class.call(delivery)

      expect(result[:ok]).to contain_exactly(eligible_campaign_user)
    end
  end
end

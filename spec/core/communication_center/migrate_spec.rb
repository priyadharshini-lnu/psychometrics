# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommunicationCenter::Migrate do
  let(:client)   { create(:tenancy) }
  let(:project)  { create(:project, parent: client) }
  let(:campaign) { create(:campaign, project: project) }

  def build_comm(overrides = {})
    comm = create(:communication, overrides.reverse_merge(
                                    client:         client,
                                    kind:           :invitation,
                                    delivery_rule:  :send_now,
                                    subject:        'Hello',
                                    body:           '<p>Body</p>',
                                    project_id:     project.id,
                                    campaign_id:    campaign.id,
                                    created_by:     create(:superadmin),
                                    updated_by:     create(:superadmin)
                                  ))
    comm.update_columns(tenant_id: client.id)
    comm
  end

  before do
    allow(Communications::Deliveries::Trigger).to receive(:call)
    allow(Communications::Deliveries::DispatchJob).to receive(:perform_later)
  end

  describe '#call with dry_run: true' do
    it 'returns correct would_migrate count without creating any records' do
      build_comm
      build_comm

      expect do
        result = described_class.new(client, dry_run: true).call
        expect(result[:would_migrate]).to eq(2)
      end.not_to(change { CommunicationTemplate.count + CommunicationDelivery.count })
    end

    it 'counts orphaned emails in would_backfill' do
      comm = build_comm
      create(:communication_email, communication: comm)
      create(:communication_email, communication: comm)

      result = described_class.new(client, dry_run: true).call

      expect(result[:would_backfill]).to eq(2)
    end

    it 'does not count emails that already have a communication_delivery_id' do
      comm = build_comm
      delivery = create(:communication_delivery)
      create(:communication_email, communication: comm, communication_delivery: delivery)
      create(:communication_email, communication: comm)

      result = described_class.new(client, dry_run: true).call

      expect(result[:would_backfill]).to eq(1)
    end

    it 'sets dry_run: true in the returned hash' do
      result = described_class.new(client, dry_run: true).call
      expect(result[:dry_run]).to eq(true)
    end

    it 'returns zero counts when the client has no communications' do
      result = described_class.new(client, dry_run: true).call

      expect(result[:would_migrate]).to eq(0)
      expect(result[:would_backfill]).to eq(0)
    end
  end

  describe '#call (live run)' do
    it 'creates a CommunicationTemplate for each communication' do
      build_comm
      build_comm

      expect { described_class.new(client).call }.
        to change(CommunicationTemplate, :count).by(2)
    end

    it 'creates a CommunicationDelivery for each communication' do
      build_comm

      expect { described_class.new(client).call }.
        to change(CommunicationDelivery, :count).by(1)
    end

    it 'sets source_communication_id on the template and delivery' do
      comm = build_comm

      described_class.new(client).call

      template = CommunicationTemplate.find_by!(source_communication_id: comm.id)
      delivery = CommunicationDelivery.find_by!(source_communication_id: comm.id)
      expect(template).to be_present
      expect(delivery).to be_present
    end

    it 'copies subject and body onto the template' do
      comm = build_comm(subject: 'My subject', body: '<p>My body</p>')

      described_class.new(client).call

      template = CommunicationTemplate.find_by!(source_communication_id: comm.id)
      expect(template.subject).to eq('My subject')
      expect(template.body).to eq('<p>My body</p>')
    end

    it 'backfills communication_delivery_id on orphaned CommunicationEmail rows' do
      comm  = build_comm
      email = create(:communication_email, communication: comm)

      described_class.new(client).call

      delivery = CommunicationDelivery.find_by!(source_communication_id: comm.id)
      expect(email.reload.communication_delivery_id).to eq(delivery.id)
    end

    it 'does NOT call Communications::Deliveries::Trigger for any delivery created during migration' do
      build_comm

      described_class.new(client).call

      expect(Communications::Deliveries::Trigger).not_to have_received(:call)
    end

    it 'returns migrated count in the result' do
      build_comm
      build_comm

      result = described_class.new(client).call

      expect(result[:migrated]).to eq(2)
    end

    it 'returns dry_run: false in a live run result' do
      result = described_class.new(client).call
      expect(result[:dry_run]).to eq(false)
    end
  end

  describe 'skip logic (idempotency)' do
    it 'skips a communication whose template already exists and increments skipped' do
      comm = build_comm
      create(:communication_template, source_communication_id: comm.id,
                                      kind: :invitation, level: :campaign, client: client,
                                      project: project, campaign: campaign)

      result = described_class.new(client).call

      expect(result[:skipped]).to eq(1)
      expect(result[:migrated]).to eq(0)
    end

    it 'skips a communication whose delivery already exists and increments skipped' do
      comm = build_comm
      template = create(:communication_template, source_communication_id: comm.id,
                                                  kind: :invitation, level: :campaign, client: client,
                                                  project: project, campaign: campaign)
      create(:communication_delivery, source_communication_id: comm.id,
                                       communication_template: template)

      result = described_class.new(client).call

      expect(result[:skipped]).to eq(1)
    end

    it 'does not create duplicate records on a second run' do
      build_comm

      described_class.new(client).call
      expect { described_class.new(client).call }.
        not_to(change { CommunicationTemplate.count + CommunicationDelivery.count })
    end
  end

  describe 'scope derivation' do
    it 'derives :project scope when project_id is set without campaign_id (idp_template_assigned)' do
      comm = build_comm(kind: :idp_template_assigned, project_id: project.id, campaign_id: nil)
      described_class.new(client).call

      template = CommunicationTemplate.find_by!(source_communication_id: comm.id)
      expect(template.level).to eq('project')
    end

    it 'derives :campaign scope when campaign_id is present' do
      comm = build_comm(project_id: project.id, campaign_id: campaign.id)
      described_class.new(client).call

      template = CommunicationTemplate.find_by!(source_communication_id: comm.id)
      expect(template.level).to eq('campaign')
    end

    it 'sets project_id to nil on the delivery when scope is campaign, even though the communication has both set' do
      # Old Communication rows for IDP/development-action kinds store both
      # project_id and campaign_id (campaign belongs to project). The delivery
      # validation rejects records with both set, so project_id must be cleared.
      comm = build_comm(kind: :idp_template_assigned,
                        project_id: project.id, campaign_id: campaign.id)
      described_class.new(client).call

      delivery = CommunicationDelivery.find_by!(source_communication_id: comm.id)
      expect(delivery.campaign_id).to eq(campaign.id)
      expect(delivery.project_id).to be_nil
    end
  end

  describe 'trigger type and status derivation' do
    it 'sets trigger_type :scheduled when delivery_start_date is present' do
      comm = build_comm(delivery_start_date: Date.current)
      described_class.new(client).call

      delivery = CommunicationDelivery.find_by!(source_communication_id: comm.id)
      expect(delivery.trigger_type).to eq('scheduled')
    end

    it 'sets trigger_type :manual when delivery_start_date is blank' do
      comm = build_comm(delivery_start_date: nil)
      described_class.new(client).call

      delivery = CommunicationDelivery.find_by!(source_communication_id: comm.id)
      expect(delivery.trigger_type).to eq('manual')
    end

    it 'sets status :completed for send_now rule when last_ran_at is present' do
      comm = build_comm(delivery_rule: :send_now, last_ran_at: 1.day.ago)
      described_class.new(client).call

      delivery = CommunicationDelivery.find_by!(source_communication_id: comm.id)
      expect(delivery.status).to eq('completed')
    end

    it 'sets status :enqueued for send_now rule when last_ran_at is nil' do
      comm = build_comm(delivery_rule: :send_now, last_ran_at: nil)
      described_class.new(client).call

      delivery = CommunicationDelivery.find_by!(source_communication_id: comm.id)
      expect(delivery.status).to eq('enqueued')
    end

    it 'sets status :active for a recurring rule (not_started)' do
      comm = build_comm(delivery_rule: :not_started, delivery_interval: '2 days')
      described_class.new(client).call

      delivery = CommunicationDelivery.find_by!(source_communication_id: comm.id)
      expect(delivery.status).to eq('active')
    end
  end

  describe 'recurring delivery activation' do
    it 'enqueues DispatchJob for a recurring communication' do
      comm = build_comm(delivery_rule: :not_started, delivery_interval: '1 days',
                        last_ran_at: 3.days.ago)
      described_class.new(client).call

      delivery = CommunicationDelivery.find_by!(source_communication_id: comm.id)
      expect(Communications::Deliveries::DispatchJob).
        to have_received(:perform_later).with(delivery.id)
    end

    it 'sets next_run_at to last_ran_at + interval when both are present' do
      last_ran = 3.days.ago
      comm     = build_comm(delivery_rule: :not_started, delivery_interval: '2 days',
                            last_ran_at: last_ran)
      described_class.new(client).call

      delivery = CommunicationDelivery.find_by!(source_communication_id: comm.id)
      expect(delivery.next_run_at).to be_within(1.second).of(last_ran + 2.days)
    end

    it 'sets next_run_at to Time.current when last_ran_at is nil' do
      comm = build_comm(delivery_rule: :not_started, delivery_interval: '2 days',
                        last_ran_at: nil)
      described_class.new(client).call

      delivery = CommunicationDelivery.find_by!(source_communication_id: comm.id)
      expect(delivery.next_run_at).to be_within(1.second).of(Time.current)
    end

    it 'does not enqueue DispatchJob for a non-recurring rule' do
      build_comm(delivery_rule: :send_now)
      described_class.new(client).call

      expect(Communications::Deliveries::DispatchJob).not_to have_received(:perform_later)
    end

    it 'increments recurring_reactivated in the result' do
      build_comm(delivery_rule: :in_progress, delivery_interval: '1 days')
      result = described_class.new(client).call

      expect(result[:recurring_reactivated]).to eq(1)
    end
  end

  describe 'error resilience' do
    it 'continues migrating remaining communications after one fails' do
      good_comm = build_comm
      bad_comm  = build_comm

      original = CommunicationCenter::Migrate.instance_method(:create_template)
      allow_any_instance_of(CommunicationCenter::Migrate).to receive(:create_template) do |instance, comm|
        raise 'boom' if comm.id == bad_comm.id

        original.bind_call(instance, comm)
      end

      result = described_class.new(client).call

      expect(result[:errors].size).to eq(1)
      expect(result[:errors].first).to include("Communication id=#{bad_comm.id}")
      expect(CommunicationTemplate.where(source_communication_id: good_comm.id)).to exist
    end

    it 'wraps each failed communication error in the errors array' do
      build_comm

      allow_any_instance_of(CommunicationCenter::Migrate).
        to receive(:create_template).and_raise(StandardError, 'something went wrong')

      result = described_class.new(client).call

      expect(result[:errors].first).to match(/something went wrong/)
    end
  end

  describe 'email user_id backfill' do
    it 'backfills user_id from campaign_users when user_id is nil' do
      comm      = build_comm
      user      = create(:user)
      camp_user = create(:campaign_user, campaign: campaign, user: user)

      # Create the email first, then clear user_id to simulate the legacy rows
      # that existed before the user_id column was added. We bypass the
      # set_user_id before_create callback by using update_columns after save.
      email = create(:communication_email, communication: comm, campaign_user: camp_user)
      email.update_columns(user_id: nil)

      described_class.new(client).call

      expect(email.reload.user_id).to eq(user.id)
    end

    it 'does not overwrite an existing user_id' do
      comm  = build_comm
      user  = create(:user)
      email = create(:communication_email, communication: comm, user: user)

      described_class.new(client).call

      expect(email.reload.user_id).to eq(user.id)
    end
  end
end

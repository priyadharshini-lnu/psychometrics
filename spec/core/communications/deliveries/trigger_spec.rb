# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Communications::Deliveries::Trigger do
  # CommunicationDelivery#after_create_commit already calls Trigger for us on create, so building the delivery
  # via the factory is itself the exercise of the code under test - these specs assert on the delivery's state
  # after creation rather than calling Trigger.call a second time.
  before do
    allow(Communications::Deliveries::DispatchJob).to receive(:perform_later)
    configured_job = instance_double(ActiveJob::ConfiguredJob, perform_later: true)
    allow(Communications::Deliveries::DispatchJob).to receive(:set).and_return(configured_job)
  end

  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:campaign) { create(:campaign, project: project) }

  describe 'report_available' do
    it 'goes straight to active with no schedule or dispatch job' do
      delivery = create(:communication_delivery, :report_available, client: client, project: project,
                                                                       campaign: campaign)

      expect(delivery.reload.status).to eq('active')
      expect(Communications::Deliveries::DispatchJob).not_to have_received(:perform_later)
      expect(Communications::Deliveries::DispatchJob).not_to have_received(:set)
    end
  end

  describe 'completion' do
    it 'goes straight to active with no schedule or dispatch job' do
      delivery = create(:communication_delivery, :completion, client: client, project: project, campaign: campaign)

      expect(delivery.reload.status).to eq('active')
      expect(Communications::Deliveries::DispatchJob).not_to have_received(:perform_later)
      expect(Communications::Deliveries::DispatchJob).not_to have_received(:set)
    end
  end

  describe 'magic_link_email' do
    it 'goes straight to active with no schedule or dispatch job' do
      delivery = create(:communication_delivery, :magic_link_email, client: client, project: project)

      expect(delivery.reload.status).to eq('active')
      expect(Communications::Deliveries::DispatchJob).not_to have_received(:perform_later)
      expect(Communications::Deliveries::DispatchJob).not_to have_received(:set)
    end
  end

  describe 'idp_template_assigned' do
    it 'goes straight to active with no schedule or dispatch job' do
      delivery = create(:communication_delivery, :idp_template_assigned, client: client, project: project,
                                                                             campaign: campaign)

      expect(delivery.reload.status).to eq('active')
      expect(Communications::Deliveries::DispatchJob).not_to have_received(:perform_later)
      expect(Communications::Deliveries::DispatchJob).not_to have_received(:set)
    end

    it 'is valid scoped to a project only and goes straight to active' do
      delivery = create(:communication_delivery, :idp_template_assigned, :project_scoped, client: client,
                                                                                            project: project)

      expect(delivery.reload.status).to eq('active')
    end
  end

  describe 'workshop_invite' do
    it 'goes straight to active with no schedule or dispatch job' do
      delivery = create(:communication_delivery, :workshop_invite, client: client, project: project,
                                                                       campaign: campaign)

      expect(delivery.reload.status).to eq('active')
      expect(Communications::Deliveries::DispatchJob).not_to have_received(:perform_later)
      expect(Communications::Deliveries::DispatchJob).not_to have_received(:set)
    end
  end

  describe 'workshop_booked' do
    it 'goes straight to active with no schedule or dispatch job' do
      delivery = create(:communication_delivery, :workshop_booked, client: client, project: project,
                                                                       campaign: campaign)

      expect(delivery.reload.status).to eq('active')
    end
  end

  describe 'workshop_cancelled' do
    it 'goes straight to active with no schedule or dispatch job' do
      delivery = create(:communication_delivery, :workshop_cancelled, client: client, project: project,
                                                                          campaign: campaign)

      expect(delivery.reload.status).to eq('active')
    end
  end

  describe 'workshop_upcoming_reminder (event-fired, distinct from workshop_invite_reminder)' do
    it 'goes straight to active with no schedule or dispatch job' do
      delivery = create(:communication_delivery, :workshop_upcoming_reminder, client: client, project: project,
                                                                                  campaign: campaign)

      expect(delivery.reload.status).to eq('active')
      expect(Communications::Deliveries::DispatchJob).not_to have_received(:perform_later)
      expect(Communications::Deliveries::DispatchJob).not_to have_received(:set)
    end
  end

  describe 'only one active event-fired delivery per kind per campaign_assessment_group' do
    it 'deactivates a prior active delivery of the same kind in the same campaign_assessment_group' do
      assessment_group = create(:campaign_assessment_group, campaign: campaign)
      previous = create(:communication_delivery, :workshop_booked, client: client, project: project,
                                                                       campaign: campaign,
                                                                       campaign_assessment_group: assessment_group)
      expect(previous.reload.status).to eq('active')

      new_delivery = create(:communication_delivery, :workshop_booked, client: client, project: project,
                                                                           campaign: campaign,
                                                                           campaign_assessment_group: assessment_group)

      expect(new_delivery.reload.status).to eq('active')
      expect(previous.reload.status).to eq('cancelled')
      expect(previous.cancelled_at).to be_present
    end

    it 'does not deactivate a delivery of the same kind in a different campaign_assessment_group within the ' \
       'same campaign' do
      group_a = create(:campaign_assessment_group, campaign: campaign)
      group_b = create(:campaign_assessment_group, campaign: campaign)
      delivery_a = create(:communication_delivery, :workshop_booked, client: client, project: project,
                                                                         campaign: campaign,
                                                                         campaign_assessment_group: group_a)

      delivery_b = create(:communication_delivery, :workshop_booked, client: client, project: project,
                                                                         campaign: campaign,
                                                                         campaign_assessment_group: group_b)

      expect(delivery_a.reload.status).to eq('active')
      expect(delivery_b.reload.status).to eq('active')
    end
  end

  describe 'only one active event-fired delivery per kind per scope' do
    it 'deactivates a prior active campaign-scoped delivery of the same kind' do
      previous = create(:communication_delivery, :idp_template_assigned, client: client, project: project,
                                                                             campaign: campaign)
      expect(previous.reload.status).to eq('active')

      new_delivery = create(:communication_delivery, :idp_template_assigned, client: client, project: project,
                                                                                 campaign: campaign)

      expect(new_delivery.reload.status).to eq('active')
      expect(previous.reload.status).to eq('cancelled')
      expect(previous.cancelled_at).to be_present
    end

    it 'does not deactivate a delivery of a different kind' do
      report_available = create(:communication_delivery, :report_available, client: client, project: project,
                                                                                campaign: campaign)

      create(:communication_delivery, :idp_template_assigned, client: client, project: project, campaign: campaign)

      expect(report_available.reload.status).to eq('active')
    end

    it 'does not deactivate a delivery scoped to a different campaign' do
      other_campaign = create(:campaign, project: project)
      other_campaign_delivery = create(:communication_delivery, :idp_template_assigned, client: client,
                                                                                          project: project,
                                                                                          campaign: other_campaign)

      create(:communication_delivery, :idp_template_assigned, client: client, project: project, campaign: campaign)

      expect(other_campaign_delivery.reload.status).to eq('active')
    end

    it 'lets a campaign-scoped and a project-scoped delivery of the same kind stay active independently' do
      project_delivery = create(:communication_delivery, :idp_template_assigned, :project_scoped, client: client,
                                                                                                     project: project)
      campaign_delivery = create(:communication_delivery, :idp_template_assigned, client: client, project: project,
                                                                                      campaign: campaign)

      expect(project_delivery.reload.status).to eq('active')
      expect(campaign_delivery.reload.status).to eq('active')
    end
  end

  describe 'send_now (existing behaviour unaffected)' do
    it 'enqueues to dispatch' do
      delivery = create(:communication_delivery, client: client, project: project, campaign: campaign,
                                                    delivery_rule: :send_now)

      expect(delivery.reload.status).to eq('enqueued')
      expect(Communications::Deliveries::DispatchJob).to have_received(:perform_later).with(delivery.id)
    end
  end
end

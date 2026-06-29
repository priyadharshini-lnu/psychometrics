# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::WorkshopsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let!(:workshop) { create(:workshop, :with_managers, :with_assessors, campaign_id: campaign_id) }
  let!(:workshop_id) { workshop.id }
  let!(:workshop_subject) { create(:workshop_subject, workshop: workshop) }
  let!(:user1) { create(:user, email: 'user1@test.test') }
  let!(:user2) { create(:user, email: 'user2@test.test') }
  let!(:manager) { workshop.workshop_managers.first }
  let!(:assessor) { workshop.workshop_assessors.first }
  let!(:campaign_admin) { create(:user, role: User::ADMIN_ROLE) }
  let!(:workshop_view_membership_grant) do
    create(:membership_grants, data: { workshops: %w[view manage],
                                       campaigns: %w[view] })
  end

  let!(:membership) do
    create(:campaign_admin_membership, grants: workshop_view_membership_grant, user: campaign_admin, campaign: campaign)
  end
  let!(:workshop_without_subject) { create(:workshop, campaign: campaign) }
  let!(:workshop_without_subject_id) { workshop_without_subject.id }
  let(:campaign_assessment_group) { create(:campaign_assessment_group, campaign: campaign) }

  before { sign_in(superadmin) }

  describe 'GET /campaigns/:campaign_id/workshops' do
    it 'returns workshops list' do
      get "/api/v2/administration/campaigns/#{campaign_id}/workshops"

      expect(response).to have_http_status(:ok)
      workshop_response = JSON.parse(response.body)['data'].first
      expect(workshop_response).to have_attribute(:start_time).with_value('2018-09-15T09:31:42.000+04:00')
      expect(workshop_response).to have_attribute(:duration).with_value(workshop.duration)
      expect(workshop_response).to have_relationship(:workshop_managers)
      expect(workshop_response).to have_relationship(:workshop_assessors)
    end
  end

  describe 'DELETE /campaigns/:campaign_id/workshops/:workshop_id/remove_workshop' do
    before do
      sign_in(campaign_admin)
    end

    after do
      sign_out(campaign_admin)
    end

    context 'when workshop has no subject' do
      it 'removes workshop' do
        delete "/api/v2/administration/campaigns/#{campaign_id}/workshops/" \
               "#{workshop_without_subject_id}/remove_workshop"

        expect(response).to have_http_status(:ok)
        expect { Workshop.find(workshop_without_subject_id) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  context 'when workshop has subject' do
    it 'does not get deleted and returns error' do
      delete "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop.id}/remove_workshop"

      data = JSON.parse(response.body)['errors']
      expect(response.status).to be(422)
      expect(data[0]['code']).to include('error')
    end
  end

  describe 'POST /campaigns/:campaign_id/workshops/:workshop_id/bulk_update_subjects' do
    before do
      create(:campaign_user, campaign: workshop.campaign, user: workshop_subject.user)
      @user_assessment = create(:user_assessment, campaign: workshop.campaign, subject: workshop_subject.user)
    end

    it 'bulk updates workshop subjects' do
      body = {
        data: {
          type: 'workshops',
          attributes: {
            subject_ids: [workshop_subject.id],
            assessments: [
              {
                action: 'schedule',
                assessment_id: @user_assessment.assessment_id,
                time: '2023-08-04T02:00:00.063Z'
              }
            ],
            override_existing: true
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop_id}/bulk_update_subjects",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      expect(@user_assessment.reload.schedule_time).to eq('Fri, 04 Aug 2023 06:00:00.063000000 +04 +04:00')
    end
  end

  describe 'PUT /campaigns/:campaign_id/workshops/:workshop_id' do
    it 'updates workshop' do
      body = {
        data: {
          type: 'workshops',
          id: workshop_id.to_s,
          attributes: {
            total_seats: 20,
            name: 'name',
            video_call_type: 'custom',
            meeting_link: 'https://www.abc.com',
            workshop_assessors_ids: [assessor.user_id.to_s, user1.id.to_s],
            workshop_managers_ids: [user2.id.to_s],
            scheduling_lead_time: 60,
            cancellation_lead_time: 60,
            allow_late_cancellation_and_rescheduling: false,
            campaign_assessment_group_id: campaign_assessment_group.id.to_s,
            start_time: DateTime.now
          }
        }
      }

      put "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop_id}", params: body.to_json,
headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      expect(workshop.reload.total_seats).to eq(20)
      expect(workshop.name).to eq('name')
      expect(workshop.meeting_link).to eq('https://www.abc.com')
      expect(workshop.workshop_assessors.count).to eq(2)
      expect(workshop.workshop_assessors).to include(WorkshopAssessor.find_by(user_id: user1.id))
      expect(workshop.workshop_assessors).to include(assessor)
      expect(workshop.workshop_managers).to include(WorkshopManager.find_by(user_id: user2.id))
      expect(workshop.workshop_managers).not_to include(manager)
      expect(workshop.workshop_managers.count).to eq(1)
      expect(workshop.scheduling_lead_time).to eq(60)
      expect(workshop.cancellation_lead_time).to eq(60)
      expect(workshop.allow_late_cancellation_and_rescheduling).to eq(false)
      expect(workshop.campaign_assessment_group_id).to eq(campaign_assessment_group.id)
    end
  end
end

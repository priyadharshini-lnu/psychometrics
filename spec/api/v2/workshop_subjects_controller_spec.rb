# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::WorkshopSubjectsController, type: :request do
  let(:superadmin) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let!(:group) { create(:campaign_assessment_group, campaign: campaign) }
  let(:workshop) { create(:workshop, campaign_id: campaign_id, campaign_assessment_group: group) }
  let(:workshop_id) { workshop.id }
  let!(:subject) { create(:workshop_subject, workshop: workshop) }
  before do
    completed = create(:user_assessment, prework: true, campaign: campaign, subject: subject.user, status: 2)
    another_completed = create(:user_assessment, prework: true, campaign: campaign, subject: subject.user, status: 2)
    not_completed = create(:user_assessment, prework: true, campaign: campaign, subject: subject.user)
    create(:campaign_assessment, assessment: completed.assessment, campaign: campaign,
      prework: true, workshop_activity: true)
    create(:campaign_assessment, assessment: another_completed.assessment, campaign: campaign,
      prework: true, workshop_activity: true)
    create(:campaign_assessment, assessment: not_completed.assessment, campaign: campaign,
      prework: true, workshop_activity: true)

    sign_in(superadmin)
  end

  after do
    sign_out(superadmin)
    ActsAsTenant.current_tenant = nil
  end

  describe 'GET /campaigns/:campaign_id/workshops/:workshop_id/workshop_subjects' do
    it 'returns workshop subjects list' do
      get "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop_id}/workshop_subjects"

      expect(response).to have_http_status(:ok)
      subject_response = JSON.parse(response.body)['data'].first
      expect(subject_response).to have_attribute(:attendance_status).with_value('no_status')
      expect(subject_response).to have_attribute(:attended).with_value(false)
      expect(subject_response).to have_attribute(:preworks).with_value('2/3')
      expect(subject_response).to have_attribute(:workshop_activities).with_value('2/3')
      expect(subject_response).to have_relationship(:user).
        with_data({ 'id' => subject.user_id.to_s, 'type' => 'users' })
    end
  end

  describe 'PATCH /campaigns/:campaign_id/workshops/:workshop_id/workshop_subjects/:subject_id' do
    let(:test_subject) { create(:workshop_subject, workshop: workshop, attended: true, attendance_status: 'no_status') }
    let(:subject_id) { test_subject.id }

    it 'updates workshop subject' do
      body = {
        data: {
          id: subject_id.to_s,
          type: 'workshop_subjects',
          attributes: {
            attended: false
          }
        }
      }

      patch "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop_id}/workshop_subjects/#{subject_id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      subject_response = JSON.parse(response.body)['data']
      expect(subject_response).to have_attribute(:attended).with_value(false)
      expect(subject_response).to have_attribute(:attendance_status).with_value('no_show')
    end
  end

  describe 'POST /campaigns/:campaign_id/workshops/:workshop_id/workshop_subjects' do
    let(:user) { create(:user, project: campaign.project) }

    it 'links to an existing accepted invite subject in the same group' do
      new_workshop = create(:workshop, campaign: campaign, campaign_assessment_group: group)
      workshop_invite = create(
        :workshop_invite,
        campaign: campaign,
        campaign_assessment_group: group,
        workshops: [workshop]
      )
      workshop_invited_subject = create(
        :workshop_invited_subject,
        user: user,
        workshop_invite: workshop_invite,
        status: 'accepted'
      )
      create(
        :workshop_subject,
        workshop: workshop,
        user: user,
        campaign: campaign,
        workshop_invited_subject: workshop_invited_subject,
        scheduling_status: 'cancelled'
      )

      body = {
        data: {
          type: 'workshop_subjects',
          attributes: {},
          relationships: {
            user: { data: { id: user.id.to_s, type: 'users' } },
            workshop: { data: { id: new_workshop.id.to_s, type: 'workshops' } }
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{new_workshop.id}/workshop_subjects",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to be_successful, response.body
      created_subject_id = JSON.parse(response.body).dig('data', 'id')
      created_subject = WorkshopSubject.find(created_subject_id)

      expect(created_subject.workshop_invited_subject_id).to eq(workshop_invited_subject.id)
      expect(workshop_invited_subject.reload.status).to eq('accepted')
    end

    it 'links and accepts a pending invite that contains the workshop' do
      workshop_invite = create(
        :workshop_invite,
        campaign: campaign,
        campaign_assessment_group: group,
        workshops: [workshop]
      )
      workshop_invited_subject = create(
        :workshop_invited_subject,
        user: user,
        workshop_invite: workshop_invite,
        status: 'pending'
      )

      body = {
        data: {
          type: 'workshop_subjects',
          attributes: {},
          relationships: {
            user: { data: { id: user.id.to_s, type: 'users' } },
            workshop: { data: { id: workshop.id.to_s, type: 'workshops' } }
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop.id}/workshop_subjects",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to be_successful, response.body
      created_subject_id = JSON.parse(response.body).dig('data', 'id')
      created_subject = WorkshopSubject.find(created_subject_id)

      expect(created_subject.workshop_invited_subject_id).to eq(workshop_invited_subject.id)
      expect(workshop_invited_subject.reload.status).to eq('accepted')
    end
  end

  describe 'DELETE /campaigns/:campaign_id/workshops/:workshop_id/workshop_subjects/:subject_id' do
    it 'deletes workshop subject' do
      subject_id = subject.id

      delete "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop_id}/workshop_subjects/#{subject_id}"

      expect(response).to have_http_status(:no_content)
      expect(response.body).to eq('')
      expect { WorkshopSubject.find(subject_id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe 'POST /campaigns/:campaign_id/workshops/:workshop_id/workshop_subjects' do
    let(:candidate) { create(:user, project: campaign.project) }
    let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: candidate) }
    let!(:group_one) { create(:campaign_assessment_group, campaign: campaign) }
    let!(:group_two) { create(:campaign_assessment_group, campaign: campaign) }
    let!(:workshop_one) { create(:workshop, campaign: campaign, campaign_assessment_group: group_one) }
    let!(:workshop_two) { create(:workshop, campaign: campaign, campaign_assessment_group: group_two) }

    def create_workshop_subject_payload(user_id, selected_workshop_id)
      {
        data: {
          type: 'workshop_subjects',
          attributes: {
            attended: false,
            attendance_status: 'no_status'
          },
          relationships: {
            user: {
              data: {
                id: user_id.to_s,
                type: 'users'
              }
            },
            workshop: {
              data: {
                id: selected_workshop_id.to_s,
                type: 'workshops'
              }
            }
          }
        }
      }
    end

    it 'links to pending invite from same group and workshop only' do
      invite_group_one = create(
        :workshop_invite,
        campaign: campaign,
        campaign_assessment_group: group_one,
        workshops: [workshop_one]
      )
      invite_group_two = create(
        :workshop_invite,
        campaign: campaign,
        campaign_assessment_group: group_two,
        workshops: [workshop_two]
      )

      group_one_invited_subject = create(
        :workshop_invited_subject,
        workshop_invite: invite_group_one,
        user: candidate,
        status: :pending
      )
      group_two_invited_subject = create(
        :workshop_invited_subject,
        workshop_invite: invite_group_two,
        user: candidate,
        status: :pending
      )

      post "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop_one.id}/workshop_subjects",
           params: create_workshop_subject_payload(candidate.id, workshop_one.id).to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response.status).to eq(201), response.body

      created_subject_id = JSON.parse(response.body).dig('data', 'id')
      created_subject = WorkshopSubject.find(created_subject_id)

      expect(created_subject.workshop_invited_subject_id).to eq(group_one_invited_subject.id)
      expect(group_one_invited_subject.reload.status).to eq('accepted')
      expect(group_two_invited_subject.reload.status).to eq('pending')
    end

    it 'does not link to pending invite from another group when same-group invite is not pending' do
      invite_group_one = create(
        :workshop_invite,
        campaign: campaign,
        campaign_assessment_group: group_one,
        workshops: [workshop_one]
      )
      invite_group_two = create(
        :workshop_invite,
        campaign: campaign,
        campaign_assessment_group: group_two,
        workshops: [workshop_two]
      )

      create(
        :workshop_invited_subject,
        workshop_invite: invite_group_one,
        user: candidate,
        status: :accepted
      )
      group_two_invited_subject = create(
        :workshop_invited_subject,
        workshop_invite: invite_group_two,
        user: candidate,
        status: :pending
      )

      post "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop_one.id}/workshop_subjects",
           params: create_workshop_subject_payload(candidate.id, workshop_one.id).to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response.status).to eq(201), response.body

      created_subject_id = JSON.parse(response.body).dig('data', 'id')
      created_subject = WorkshopSubject.find(created_subject_id)

      expect(created_subject.workshop_invited_subject_id).to be_nil
      expect(group_two_invited_subject.reload.status).to eq('pending')
    end
  end
end

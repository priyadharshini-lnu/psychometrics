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

  describe 'DELETE /campaigns/:campaign_id/workshops/:workshop_id/workshop_subjects/:subject_id' do
    it 'deletes workshop subject' do
      subject_id = subject.id

      delete "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop_id}/workshop_subjects/#{subject_id}"

      expect(response).to have_http_status(:no_content)
      expect(response.body).to eq('')
      expect { WorkshopSubject.find(subject_id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end

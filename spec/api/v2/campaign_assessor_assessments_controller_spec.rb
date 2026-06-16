# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::CampaignAssessorAssessmentsController,
               type: :request do
  let!(:campaign_assessor_assessment) { create(:campaign_assessor_assessment) }
  let!(:campaign_id) { campaign_assessor_assessment.campaign_id }
  let!(:assessment_id) { campaign_assessor_assessment.assessment_id.to_s }
  let!(:superadmin) { create(:superadmin) }

  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/campaigns/:campaign_id/campaign_assessor_assessments' do
    it 'fetches campaign assessor assessments list' do
      get "/api/v2/administration/campaigns/#{campaign_id}/campaign_assessor_assessments"

      expect(response).to have_http_status(:ok)
      campaign_assessor_assessments = JSON.parse(response.body)
      campaign_assessor_assessments_response = campaign_assessor_assessments['data'].find do |c|
        c['id'] == campaign_assessor_assessment.id.to_s
      end
      expect(campaign_assessor_assessments_response).to have_key('id')
      expect(campaign_assessor_assessments_response).to have_attribute(:assessment_id).with_value(assessment_id)
    end
  end

  describe 'POST /api/v2/administration/campaigns/:campaign_id/campaign_assessor_assessments' do
    it 'creates a campaign assessor assessment' do
      assessment = create(:assessment)
      body = jsonapi_resource_request(
        'campaign_assessor_assessments',
        { assessment_id: assessment.id.to_s }
      )

      post "/api/v2/administration/campaigns/#{campaign_id}/campaign_assessor_assessments",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      assessor_assessment_response = JSON.parse(response.body)['data']
      expect(assessor_assessment_response).to have_key('id')
      expect(assessor_assessment_response).to have_attribute(:assessment_id).with_value(assessment.id.to_s)
    end
  end

  describe 'GET /api/v2/administration/campaigns/:campaign_id/workshop_subjects/' \
           ':workshop_subject_id/campaign_assessor_assessments/subject_assessor_assessments' do
    it 'returns all assessor assessments for a subject' do
      workshop_subject = create(:workshop_subject)
      campaign = create(:campaign)
      linked_assessment = create(:assessment)
      assessment = create(:assessment, linked_assessment_id: linked_assessment.id)
      create(:campaign_assessor_assessment, campaign: campaign, assessment: assessment,
        campaign_assessment_group_id: workshop_subject.workshop.campaign_assessment_group_id)
      create(:campaign_assessment, campaign: campaign,
        assessment: linked_assessment,
        campaign_assessment_group_id: workshop_subject.workshop.campaign_assessment_group_id)
      relationship = create(:relationship, name: 'Assessor', type: :global)
      create(:relationship, name: 'Self', type: :global)
      assessor_user_assessment = create(:user_assessment, relationship: relationship,
                                       subject: workshop_subject.user,
                                       campaign: campaign,
                                       meeting_type: :not_available,
                                       assessment: assessment)
      create(:user_assessment, relationship: Relationship.self_relationship,
                              subject: workshop_subject.user,
                              evaluator: workshop_subject.user,
                              assessment: linked_assessment,
                              campaign: campaign,
                              meeting_type: :not_available)
      workshop_subject_id = workshop_subject.id.to_s
      campaign_id = campaign.id.to_s

      get "/api/v2/administration/campaigns/#{campaign_id}/workshop_subjects/" \
          "#{workshop_subject_id}/campaign_assessor_assessments/subject_assessor_assessments",
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      assessment_response = JSON.parse(response.body)

      expect(assessment_response['assessor_user_assessments'][0]).to have_key('id')
      expect(assessment_response['assessor_user_assessments']).to match_array([{
        'id' => assessor_user_assessment.id.to_s,
        'name' => assessor_user_assessment.assessment.name,
        'status' => assessor_user_assessment.status,
        'schedule_time' => assessor_user_assessment.schedule_time,
        'meeting_link' => assessor_user_assessment.meeting_link,
        'assessor' => {
          'id' => assessor_user_assessment.evaluator.id.to_s,
          'user_id' => assessor_user_assessment.evaluator.id.to_s,
          'name' => assessor_user_assessment.evaluator.name,
          'photo_url' => assessor_user_assessment.evaluator.photo_url
        },
        'meeting_type' => 'not_available',
        'assessment_id' => assessor_user_assessment.assessment_id,
        'linked_activity_id' => linked_assessment.id.to_s,
        'linked_activity_name' => linked_assessment.name
      }])
    end
  end
end

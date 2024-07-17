# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::CampaignAssessorAssessmentsController, swagger_doc: 'v2/swagger.json',
  type: :request do
  let!(:campaign_assessor_assessment) { create(:campaign_assessor_assessment) }
  let!(:campaign_id) { campaign_assessor_assessment.campaign_id }
  let!(:assessment_id) { campaign_assessor_assessment.assessment_id.to_s }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/campaigns/{campaign_id}/campaign_assessor_assessments/' do
    get 'Campaign Assessor Assessment List' do
      operationId 'CampaignAssessorAssessmentList'
      description 'Fetch Campaigns Assessor Assessments list'

      tags 'Campaign Assessor Assessment'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'Campaigns Assessor Assessment list' do
        schema '$ref' => '#/components/schemas/CampaignAssessorAssessmentListResponse'

        examples 'application/json' => [{
          type: 'campaign_assessor_assessments',
          data: {
            id: '1',
            attributes: {
              campaign_id: '1',
              assessment_id: '1'
            }
          }
        }]

        run_test! do |response|
          campaign_assessor_assessments = JSON.parse(response.body)
          campaign_assessor_assessments_response = campaign_assessor_assessments['data'].find do |c|
            c['id'] == campaign_assessor_assessment.id.to_s
          end
          expect(campaign_assessor_assessments_response).to have_key('id')
          expect(campaign_assessor_assessments_response).to have_attribute(:assessment_id).with_value(assessment_id)
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_assessor_assessments/' do
    post 'Create a Campaign Assessor Assessment' do
      operationId 'CreateCampaignAssessorAssessment'
      description 'Create new Campaign Assessor Assessment'
      tags 'Campaign Assessor Assessment'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/CampaignAssessorAssessmentCreateRequest' },
                required: true

      response '201', 'Assessor Assessment Created' do
        schema '$ref' => '#/components/schemas/CampaignAssessmentAssessorResponse'
        examples 'application/json' => [{
          data: {
            type: 'campaign_assessor_assessments',
            attributes: {
              assessment_id: '1',
              campaign_id: '1'
            }
          }
        }]

        let(:assessment) { create(:assessment) }
        let(:campaign) { create(:campaign) }
        let(:body) do
          jsonapi_resource_request(
            'campaign_assessor_assessments',
            { assessment_id: assessment.id.to_s }
          )
        end

        run_test! do |response|
          assessor_assessment_response = JSON.parse(response.body)['data']
          expect(assessor_assessment_response).to have_key('id')
          expect(assessor_assessment_response).to have_attribute(:assessment_id).with_value(assessment.id.to_s)
        end
      end
    end
  end

  path "/campaigns/{campaign_id}/workshop_subjects/{workshop_subject_id}/campaign_assessor_assessments/\
subject_assessor_assessments" do
    get 'returns all assessor assessments for a subject' do
      operationId 'GetSubjectsAssessorAssessments'
      description 'Get all subject specific assessor assessments'
      tags 'Subject Assessor Assessments'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :workshop_subject_id, in: :path, type: :string

      response '200', 'Subject Assessor Assessments' do
        examples 'application/json' => {
          assessor_user_assessments: [{
            id: '1',
            name: 'Assessment 1',
            status: 'pending',
            schedule_time: '2023-08-04T02:00:00.063Z',
            meeting_link: 'http://www.example.com',
            assessor: {
              id: '1',
              user_id: 1,
              name: 'Assessor 1',
              photo_url: 'http://www.example.com'
            },
            assessment_id: 1,
            linked_activity_id: '1'
          }],
          campaign_assessor_assessments: [{
            id: '1',
            name: 'Assessment 1',
            assessment_id: 1,
            linked_activity_id: '1'
          }]
        }

        let(:workshop_subject) { create(:workshop_subject) }
        let(:campaign) { create(:campaign) }
        let(:linked_assessment) { create(:assessment) }
        let(:assessment) { create(:assessment, linked_assessment_id: linked_assessment.id) }
        let(:campaign_assessor_assessment) do
          create(:campaign_assessor_assessment, campaign: campaign, assessment: assessment)
        end
        let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign) }
        let!(:relationship) { create(:relationship, name: 'Assessor', type: :global) }
        let!(:self_relationship) { create(:relationship, name: 'Self', type: :global) }
        let!(:assessor_user_assessment) do
          create(:user_assessment, relationship: relationship,
                                   subject: workshop_subject.user,
                                   campaign: campaign,
                                   assessment: assessment)
        end
        let!(:subject_user_assessment) do
          create(:user_assessment, relationship: Relationship.self_relationship,
                                    subject: workshop_subject.user,
                                    evaluator: workshop_subject.user,
                                    assessment: linked_assessment,
                                    campaign: campaign)
        end
        let(:workshop_subject_id) { workshop_subject.id.to_s }
        let(:campaign_id) { campaign.id.to_s }

        run_test! do |response|
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
            'meeting_type' => assessor_user_assessment.meeting_type,
            'assessment_id' => assessor_user_assessment.assessment_id,
            'linked_activity_id' => linked_assessment.id.to_s
          }])

          expect(assessment_response['campaign_assessor_assessments']).to match_array([{
            'id' => campaign_assessor_assessment.id,
            'name' => campaign_assessor_assessment.assessment.name,
            'assessment_id' => campaign_assessor_assessment.assessment_id,
            'linked_activity_id' => campaign_assessor_assessment.assessment.linked_assessment_id.to_s
          }])
        end
      end
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhooks::SkillvueController, type: :controller do
  let!(:project) { create(:project) }
  let(:config) { { 'api_key' => 'api_key' } }
  let!(:skillvue_assessment) { create(:skillvue_assessment, project_id: project.id) }
  let(:assessment) do
    create(:assessment, :skillvue, project: project, external_settings: { assessment_id: skillvue_assessment.id })
  end

  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }
  let!(:skillvue_user_assessment) do
    create(:skillvue_user_assessment, user_assessment: user_assessment)
  end

  let(:encoded_user_assessment_id) { UserAssessment.encode_id(user_assessment.id) }

  describe 'POST #completion_notification' do
    let(:json_payload) do
      {
        type: 'assessment.completed',
        payload: {
          id: encoded_user_assessment_id,
          lang: 'en',
          email: "#{encoded_user_assessment_id}-bcf2cd3be@example.com",
          name: '45282',
          surname: '45282'
        },
        userId: encoded_user_assessment_id,
        timestamp: '2025-06-02T05:35:45.314Z'
      }.to_json
    end

    it 'sets user_assessment as completed' do
      post :completion_notification, params: { project_id: 1 }, body: json_payload

      expect(response).to have_http_status(:ok)

      user_assessment.reload
      expect(user_assessment.completed?).to be_truthy
    end
  end

  describe 'POST #notification with invalid userId' do
    let(:json_payload) do
      {
        type: 'assessment.completed',
        payload: {
          id: '0-invaliduser',
          lang: 'en',
          email: '0-invaliduser@example.com',
          name: '45282',
          surname: '45282'
        },
        userId: '0-invaliduser',
        timestamp: '2025-06-02T05:35:45.314Z'
      }.to_json
    end

    it 'returns ok without processing' do
      expect(Skillvue::SaveScoresAndReport).not_to receive(:call!)

      post :completion_notification, params: { project_id: 1 }, body: json_payload

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST #results' do
    let(:json_payload) do
      {
        type: 'report.ready',
        payload: {
          candidate: {
            name: '45282',
            surname: '45282',
            email: "#{encoded_user_assessment_id}-bcf2cd3be@example.com",
            timestamp: '2025-06-02T05:36:59.827Z',
            position: 'MTE Test',
            language: 'en'
          },
          report: 'https://gpt-reports-storage.s3.eu-west-1.amazonaws.com/demo/4391a51016e15ee2cdab0fc07be4c473/report_light.pdf',
          overallMatchPercentage: 65,
          skills: [
            {
              name: 'Cognitive Flexibility',
              rating: 2,
              methodology: 'Video Interview',
              questions: 3,
              duration: 72,
              definition: 'Ability to adapt to context and different requirements to achieve expected outcomes.',
              behavioralIndicators: [
                {
                  name: 'Seize opportunities',
                  description: 'Accepts the challenge of new, uncertain and poorly defined situations.',
                  evaluation: 'Not expressed'
                },
                {
                  name: 'Be flexible',
                  description: 'Applies rules and procedures flexibly to achieve business goals.',
                  evaluation: 'Moderately expressed'
                }
              ],
              summary: 'The candidate demonstrates limited cognitive flexibility.'
            },
            {
              name: 'Advanced Quality',
              rating: 4,
              methodology: 'Multiple Choice',
              questions: 7,
              duration: 482,
              topics: { projectManagement: 50, statistics: 100, machineLearning: 67 },
              summary: 'The candidate demonstrates strong competence in advanced quality management.'
            }
          ]
        },
        userId: encoded_user_assessment_id,
        timestamp: '2025-06-02T05:36:59.827Z'
      }.to_json
    end

    it 'sets user_assessment as completed and saves response' do
      expect(Skillvue::SaveScoresAndReport).to receive(:call!).with(user_assessment, JSON.parse(json_payload))

      post :results, params: { project_id: 1 }, body: json_payload

      expect(response).to have_http_status(:ok)

      user_assessment.reload
      expect(user_assessment.completed?).to be_truthy
    end
  end
end

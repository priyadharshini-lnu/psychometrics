# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V1::ThreesixtyCampaigns::UsersController, swagger_doc: 'v1/swagger.json', type: :request do
  let!(:membership) { create(:client_admin_membership, :with_application_user) }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:campaign) { create(:campaign, :threesixty, project: project) }
  let!(:user) { create(:user, project: project, external_id: 'ext100') }
  let!(:subject_user) { create(:user, project: project, external_id: '123') }
  let!(:dimension) { create(:dimension) }
  let!(:assessment) { create(:assessment, dimension: dimension) }
  let!(:threesixty_campaign) { create(:threesixty_campaign, assessment: assessment, campaign: campaign) }
  let!(:factor) { create(:factor, name: 'Factor1', description: 'Some descrition', dimension: dimension) }
  let!(:user_assessment) do
    create(
      :user_assessment,
      evaluator: user,
      subject: subject_user,
      campaign: campaign,
      status: 'completed',
      started_at: 2.days.ago,
      completed_at: 1.day.ago
    )
  end
  let!(:relationship) { create(:relationship, name: 'Self', campaign: campaign) }
  let!(:self_assessment) do
    create(:user_assessment,
           evaluator: subject_user,
           subject: subject_user,
           campaign: campaign,
           relationship: relationship,
           status: 'completed').tap do |assessment|
      assessment.users_result.update!(scoring: { dimension.id.to_s => { 'score' => 4.0 } })
    end
  end
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before do
    create(:api_key, token: 'token', key: 'key', user: membership.user)
  end

  path '/projects/{project_id}/threesixty_campaigns/{campaign_id}/users/{user_id}/assessments' do
    get 'List 360 evaluations' do
      operationId 'getThreesixtyEvaluations'
      description 'Fetches 360 evaluations for an evaluator'
      tags 'Threesixty'
      security [basic: []]
      consumes 'application/json'

      parameter name: :project_id, in: :path, type: :string, required: true, description: 'Project ID'
      parameter name: :campaign_id, in: :path, type: :string, required: true, description: 'Campaign ID'
      parameter name: :user_id, in: :path, type: :string, required: true, description: 'User ID or External ID'
      parameter name: :'X-USER-ID-TYPE', in: :header, type: :string, required: false,
                description: 'Specify "external_id" to use external ID'

      response '200', 'Evaluations listed successfully' do
        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:user_id) { user.id }

        run_test! do |response|
          body = JSON.parse(response.body)
          evaluations = body['evaluations']

          expect(evaluations).to be_an(Array)
          expect(evaluations.size).to eq(1)
          evaluation = evaluations.first
          expect(evaluation['subject_id']).to eq(subject_user.id)
          expect(evaluation['status']).to eq(user_assessment.status)
          expect(evaluation['started_at']).to eq(user_assessment.started_at.as_json)
          expect(evaluation['completed_at']).to eq(user_assessment.completed_at.as_json)
        end
      end

      response '200', 'Evaluations listed successfully using external_id' do
        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:user_id) { user.external_id }
        let(:'X-USER-ID-TYPE') { 'external_id' }

        run_test! do |response|
          body = JSON.parse(response.body)
          evaluations = body['evaluations']

          expect(evaluations).to be_an(Array)
          expect(evaluations.size).to eq(1)
          evaluation = evaluations.first
          expect(evaluation['subject_id']).to eq(subject_user.id)
          expect(evaluation['status']).to eq(user_assessment.status)
        end
      end

      response '400', '360 campaign required' do
        let(:project_id) { project.id }
        let(:campaign_id) { create(:campaign, project: project).id }
        let(:user_id) { subject_user.id }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error['message']).to eq('Invalid request')
          expect(error['more_info']).to eq('The campaign must be a Threesixty campaign')
        end
      end
    end
  end

  path '/projects/{project_id}/threesixty_campaigns/{campaign_id}/users/{user_id}/scores' do
    get 'Fetch 360 scores for a user' do
      operationId 'getThreesixtyScores'
      description 'Fetches 360 scores and gaps for a specific user in a campaign'
      tags 'Threesixty'
      security [basic: []]
      consumes 'application/json'

      parameter name: :project_id, in: :path, type: :string, required: true, description: 'Project ID'
      parameter name: :campaign_id, in: :path, type: :string, required: true, description: 'Campaign ID'
      parameter name: :user_id, in: :path, type: :string, required: true, description: 'User ID or External ID'
      parameter name: :'X-USER-ID-TYPE', in: :header, type: :string, required: false,
                description: 'Specify "external_id" to use external ID'

      response '200', 'Scores fetched successfully' do
        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:user_id) { subject_user.id }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body).to have_key('results')
          results = body['results']

          expect(results).to be_an(Array)
          expect(results.size).to eq(1)

          result = results.first
          expect(result['competency']).to eq(factor.name)
          expect(result['description']).to eq(factor.description)
          expect(result).to have_key('scores')
        end
      end

      response '200', 'Scores fetched successfully using external_id' do
        let(:project_id) { project.id }
        let(:campaign_id) { campaign.id }
        let(:user_id) { subject_user.external_id }
        let(:'X-USER-ID-TYPE') { 'external_id' }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body).to have_key('results')
          results = body['results']

          expect(results).to be_an(Array)
          expect(results.size).to eq(1)

          result = results.first
          expect(result['competency']).to eq(factor.name)
          expect(result['description']).to eq(factor.description)
          expect(result).to have_key('scores')
        end
      end

      response '400', '360 campaign required' do
        let(:project_id) { project.id }
        let(:campaign_id) { create(:campaign, project: project).id }
        let(:user_id) { subject_user.id }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error['message']).to eq('Invalid request')
          expect(error['more_info']).to eq('The campaign must be a Threesixty campaign')
        end
      end
    end
  end
end

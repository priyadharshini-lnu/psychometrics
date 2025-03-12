# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::StatsController, type: :controller do
  let(:current_user) { create(:superadmin) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:campaign) { create(:campaign, project: project) }
  let(:assessment) { create(:assessment, :with_report, name: 'Super Assessment') }

  let!(:campaign_user) do
    create(:campaign_user, campaign: campaign, started_at: Time.zone.parse('2021-11-02 00:00:00'),
   completed_at: Time.zone.parse('2021-11-03 00:00:00'), status: :completed)
  end

  let!(:user_assessment) { create(:user_assessment, campaign: campaign, assessment: assessment, status: :completed) }

  before do
    campaign.assessments = [assessment]
  end

  describe 'GET index' do
    it 'returns users and assessments stats' do
      get :index, params: { new_campaign_id: campaign.id }, format: :json

      expect(response.status).to eq(200)
    end
  end

  describe 'POST timeseries' do
    describe 'when range is more than 1 day' do
      it 'returns timeseries stats in days' do
        get :timeseries,
            params: {
              new_campaign_id: campaign.id, range: ['2021-11-01T21:00:00.000Z', '2021-12-01T20:59:59.999Z'],
              campaign_users_active_in: [true]
            }, format: :json
        parsed_response = response.parsed_body

        expect(parsed_response.first).to eq({ 'dt' => '2021-11-01T20:00:00.000Z', 'started' => 1, 'completed' => 0 })
        expect(parsed_response.second).to eq({ 'dt' => '2021-11-02T20:00:00.000Z', 'started' => 0, 'completed' => 1 })
        expect(parsed_response.last).to eq({ 'dt' => '2021-11-30T20:00:00.000Z', 'started' => 0, 'completed' => 0 })
      end
    end

    describe 'when range is less than 1 day' do
      it 'returns timeseries stats in days' do
        get :timeseries,
            params: {
              new_campaign_id: campaign.id, range: ['2021-11-01T00:00:00.000Z', '2021-11-01T23:59:59.999Z']
            }, format: :json
        parsed_response = response.parsed_body

        expect(parsed_response.first).to eq({ 'dt' => '2021-11-01T00:00:00.000Z', 'started' => 0, 'completed' => 0 })
        expect(parsed_response.last).to eq({ 'dt' => '2021-11-01T23:00:00.000Z', 'started' => 0, 'completed' => 0 })
        expect(parsed_response.length).to eq(24)
      end
    end
  end
end

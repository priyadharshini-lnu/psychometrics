# frozen_string_literal: true

require 'rails_helper'
require 'jwt'

RSpec.describe Simulation::GetAssessmentUrl, type: :service do
  let!(:project) { create(:project, subdomain: 'test') }
  let!(:campaign) { create(:campaign, project: project) }
  let!(:assessment) { create(:assessment, project: project) }
  let!(:campaign_assessment_group) { create(:campaign_assessment_group, campaign: campaign, name: 'Group') }
  let!(:campaign_assessment) { create(:campaign_assessment, assessment: assessment, campaign: campaign, position: 1) }

  let!(:user_assessment) { create(:user_assessment, assessment: assessment, project: project, campaign: campaign) }
  let!(:simulation_user_assessment) { create(:simulation_user_assessment, user_assessment: user_assessment) }
  let(:service) { described_class.new(user_assessment) }

  let(:config) { { frontend_base_url: 'https://sims.lh-develop.com' } }
  let(:credentials) { { shared_secret: 'xxxxxx-xxxx-xxxx-xxxx-xxxxxx' } }

  before do
    allow(service).to receive(:config).and_return(config)
    allow(service).to receive(:credentials).and_return(credentials)
    allow(service).to receive(:broadcast)
  end

  describe '#call' do
    let(:expected_base_url) { "#{config[:frontend_base_url]}/start?token=" }

    it 'generates the correct redirect URL' do
      expect(service).to receive(:broadcast) do |status, url|
        expect(status).to eq(:ok)
        expect(url).to start_with(expected_base_url)
      end

      service.call
    end
  end
end

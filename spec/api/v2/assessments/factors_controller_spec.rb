# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Assessments::FactorsController, type: :request do
  let!(:client) { create(:tenancy) }
  let!(:project) { create(:project, client: client) }
  let!(:project_id) { project.id }
  let!(:superadmin) { create(:superadmin) }
  let!(:dimension) { create(:dimension, :with_factor) }
  let!(:assessment) { create(:assessment, category: 'threesixty', dimension_id: dimension.id) }
  let!(:assessment_id) { assessment.id }
  let!(:campaign_template) { create(:campaign_template, assessment: assessment) }

  before { sign_in(superadmin) }

  describe 'GET /projects/:project_id/assessments/:assessment_id/factors' do
    it 'fetches factors' do
      get "/api/v2/administration/projects/#{project_id}/assessments/#{assessment_id}/factors"

      expect(response).to have_http_status(:ok)
      factor_response = JSON.parse(response.body)['data'].first
      expect(factor_response).to have_attribute(:name).with_value('factor 1')
      expect(factor_response['type']).to eq('factors')
    end
  end
end

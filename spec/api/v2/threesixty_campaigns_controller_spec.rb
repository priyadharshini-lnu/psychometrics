# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ThreesixtyCampaignsController, type: :request do
  let!(:client) { create(:tenancy) }
  let!(:project) { create(:project, client: client) }
  let!(:project_id) { project.id }
  let!(:superadmin) { create(:superadmin) }
  let!(:dimension) { create(:dimension, :with_factor) }
  let!(:assessment) { create(:assessment, category: 'threesixty', dimension_id: dimension.id) }
  let!(:campaign_template) { create(:campaign_template, assessment: assessment) }
  let!(:question) { create(:question, type: 'MatrixTable', assessment: assessment) }

  before { sign_in(superadmin) }

  describe 'POST /projects/:project_id/threesixty_campaigns/create_campaign' do
    it 'creates a threesixty campaign' do
      body = {
        data: {
          type: 'threesixty_campaigns',
          attributes: {
            name: 'new campaign',
            threesixty_type: Threesixty::Campaign::STANDARD_360,
            campaign_template_id: campaign_template.id.to_s,
            factors: assessment.dimension.factor_ids,
            questions: [
              { id: question.id, selected_choice_indexes: [0, 2] }
            ]
          }
        }
      }

      post "/api/v2/administration/projects/#{project_id}/threesixty_campaigns/create_campaign",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      response_body = response.body
      expect(JSON.parse(response_body)).to eq('ok')
      expect(AdminJobRecord.last.operation).to eq('create_threesixty_campaign')
      expect(AdminJobRecord.last.data).to include({
        'project_id' => project_id,
        'data' => { 'campaign_template_id' => campaign_template.id.to_s,
                    'factors' => assessment.dimension.factor_ids,
                    'name' => 'new campaign', 'threesixty_type' => 'standard_360',
                    'questions' => [{ 'id' => question.id, 'selected_choice_indexes' => [0, 2] }] }
      })
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::Campaigns::DimensionsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:assessor) { create(:user, :assessor) }
  let!(:campaign) { create(:campaign) }
  let!(:dimension) { create(:dimension, :with_factor) }
  let!(:dimensions_id) { dimension.id }
  let!(:assessment) { create(:assessment, dimension: dimension) }
  let(:user) { create(:user) }
  let(:campaign_id) { campaign.id }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let!(:campaign_assessor_assessment) do
    create(:campaign_assessor_assessment, campaign: campaign, assessment: assessment)
  end

  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/campaigns/{campaign_id}/dimensions/assessor_dimensions' do
    get 'Dimensions List' do
      operationId 'DimenstionsList'
      description 'Fetch dimensions list'
      tags 'Dimension'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'Campaign factor list' do
        schema '$ref' => '#/components/schemas/DimensionListResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'dimensions',
            attributes: {
              id: '1',
              name: 'Dimension'
            }
          }]
        }

        run_test! do |response|
          d = JSON.parse(response.body)['data'].first
          expect(d).to have_attribute(:name)
          expect(d['attributes']['name']).to eq(dimension.name)
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/dimensions/{dimensions_id}/factors' do
    get 'Dimensions List' do
      operationId 'DimenstionsList'
      description 'Fetch dimensions list'
      tags 'Dimension'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :dimensions_id, in: :path, type: :string

      response '200', 'Campaign factor list' do
        schema '$ref' => '#/components/schemas/FactorListResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'factors',
            attributes: {
              id: '1',
              name: 'Factor'
            }
          }]
        }

        run_test! do |response|
          d = JSON.parse(response.body)['data'].first
          expect(d).to have_attribute(:name)
          expect(d['attributes']['name']).to eq(dimension.factors.first.name)
        end
      end
    end
  end
end

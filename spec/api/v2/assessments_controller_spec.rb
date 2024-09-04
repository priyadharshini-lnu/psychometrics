# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'
require_relative './concerns/taggable_api_endpoints_shared_examples'

describe Api::V2::Administration::AssessmentsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:assessment) { create(:assessment, category: 'psychometric') }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/assessments/' do
    get 'Assessments List' do
      operationId 'AssessmentsList'

      description 'Fetch Assessments list'
      tags 'Assessments'
      consumes 'application/json'
      security [basic: []]

      response '200', 'Client list' do
        schema '$ref' => '#/components/schemas/AssessmentsListResponse'

        examples 'application/json' => [{
          type: 'clients',
          data: {
            attributes: {
              name: 'name',
              disabled: false,
              type: 'common',
              category: 'psychometric',
              created_at: '25 May 2023 / 12:35',
              updated_at: '25 May 2023 / 12:35',
              created_by: 'ROHAN PUJARI',
              description: 'asd',
              external_settings: {}
            }
          }
        }]

        run_test! do |response|
          assessments = JSON.parse(response.body)
          assessment_response = assessments['data'].find { |c| c['id'] == assessment.id.to_s }
          expect(assessment_response).to have_key('id')
          expect(assessment_response).to have_attribute(:name).with_value(assessment.name)
        end
      end
    end
  end

  path '/assessments/' do
    post 'Create an assessment' do
      operationId 'CreateAssessment'
      description <<~HEREDOC
        Create an Assessment

            **Supported fields for external assessments **

            | Name        | Description   | Applicable for |
            | ------------- |:-------------:|:-------------:|
            | external_settings[assessment_id]     | External assessment ID | Hogan, IIHT, Peason, Saville |
            | external_settings[norm_id]     | External norm ID | Peason |
            | external_settings[schedule_config]     | Additional configuration for schedule | IIHT |
            | data.relationships.project     | Project id to which we want to add the assessment | IIHT |
      HEREDOC
      description 'Create new Assessment'
      tags 'Assessments'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/AssessmentCreateRequest' },
                required: true

      response '201', 'Assessment Created' do
        schema '$ref' => '#/components/schemas/AssessmentResponse'
        examples 'application/json' => {
          data: {
            type: 'assessments',
            attributes: {
              name: 'name',
              disabled: false,
              type: 'common',
              category: 'psychometric',
              created_at: '25 May 2023 / 12:35',
              updated_at: '25 May 2023 / 12:35',
              created_by: 'ROHAN PUJARI',
              description: 'asd',
              external_settings: {},
              extra: { icon_color: 'color' },
              tag_list: ['psychometric']
            },
            relationships: {
              dimension: { data: { type: 'dimensions', id: '39' } },
              owner: { data: { type: 'clients', id: '266' } }
            }
          }
        }

        let(:dimension) { create(:dimension) }
        let(:client) { create(:tenancy) }
        let(:body) do
          {
            data: {
              type: 'assessments',
              attributes: {
                category: 'psychometric',
                description: 'name',
                name: 'name',
                type: 'common',
                extra: { icon_color: 'color' },
                tag_list: ['psychometric']
              },
              relationships: {
                dimension: { data: { type: 'dimensions', id: dimension.id.to_s } },
                owner: { data: { type: 'clients', id: client.id.to_s } }
              }
            }
          }
        end

        run_test! do |response|
          assessment_response = JSON.parse(response.body)['data']
          expect(assessment_response).to have_key('id')
          expect(assessment_response).to have_attribute(:name).with_value('name')
          expect(assessment_response).to have_relationship(:dimension).
            with_data({ 'id' => dimension.id.to_s, 'type' => 'dimensions' })
          expect(assessment_response).to have_attribute(:tag_list).with_value(['psychometric'])
        end
      end
    end
  end

  path '/assessments/{assessment_id}' do
    patch 'Update a assessment' do
      operationId 'UpdateAssessment'
      description 'Update an Assessment'
      tags 'Assessments'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :assessment_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/AssessmentUpdateRequest' },
                required: true

      response '200', 'Assessment Updated' do
        schema '$ref' => '#/components/schemas/AssessmentResponse'
        examples 'application/json' => {
          data: {
            type: 'assessments',
            attributes: {
              name: 'name',
              disabled: false,
              icon_url: '#111',
              type: 'common',
              category: 'psychometric',
              created_at: '25 May 2023 / 12:35',
              updated_at: '25 May 2023 / 12:35',
              created_by: 'ROHAN PUJARI',
              icon_color: '#000',
              description: 'asd',
              enable_video_check: true,
              enable_audio_check: true,
              enable_network_check: true,
              external_settings: {}
            },
            relationships: {
              dimension: { data: { type: 'dimensions', id: '39' } },
              owner: { data: { type: 'clients', id: '266' } }
            }
          }
        }

        let(:assessment_id) { assessment.id }

        let(:body) do
          {
            data: {
              type: 'assessments',
              id: assessment.id.to_s,
              attributes: {
                icon_color: '#111',
                enable_video_check: true,
                enable_audio_check: true,
                enable_network_check: true
              }
            }
          }
        end

        run_test! do |response|
          assessment_response = JSON.parse(response.body)['data']
          expect(assessment_response).to have_key('id')
          expect(assessment_response).to have_attribute(:icon_color).with_value('#111')
          expect(assessment_response).to have_attribute(:enable_video_check).with_value(true)
          expect(assessment_response).to have_attribute(:enable_audio_check).with_value(true)
          expect(assessment_response).to have_attribute(:enable_network_check).with_value(true)
        end
      end
    end

    delete 'Delete an assessment' do
      operationId 'DeleteAssessment'
      description 'Delete a Assessment'
      tags 'Assessments'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :assessment_id, in: :path, type: :string

      let(:assessment_id) { assessment.id }

      response '204', 'Assessment Deleted' do
        run_test! do |response|
          expect(response.body).to eq('')
          expect(Assessment.find_by(id: assessment_id).deleted?).to eq(true)
        end
      end
    end
  end

  describe 'taggable API endpoints' do
    include_examples 'taggable API endpoints', Assessment
  end
end

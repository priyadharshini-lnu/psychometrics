# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::Campaigns::AIArtifactsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:campaign) { create(:campaign) }
  let!(:ai_assistant) do
    assistant = create(:assistant)
    assistant.assistant_output_schema_keys.create!(key: 'summary')
    assistant.assistant_output_schema_keys.create!(key: 'feedback')
    assistant
  end
  let!(:ai_artifact) { create(:campaign_ai_artifact, campaign: campaign, ai_assistant: ai_assistant) }
  let!(:assessment) { create(:assessment) }
  let!(:question1) { create(:question, assessment: assessment, name: 'Question 1', type: 'MultipleChoice') }
  let!(:question2) { create(:question, assessment: assessment, name: 'Question 2', type: 'TextEntry') }
  let(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let(:campaign_id) { campaign.id }
  let!(:ai_artifact_result) do
    create(
      :campaign_ai_artifact_result,
      campaign_ai_artifact: ai_artifact,
      user: user,
      results: { 'summary' => 'This is a summary', 'feedback' => 'Good' },
      error: nil,
      created_at: 2.days.ago
    )
  end

  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before do
    sign_in(superadmin)
    question1.update!(props: { 'questionText' => 'What is your favorite color?' })
    question2.update!(props: { 'questionText' => 'Please describe your experience.' })
  end

  path '/campaigns/{campaign_id}/ai_artifacts' do
    get 'AI Artifacts' do
      operationId 'AIArtifacts'
      description 'Fetch AI artifacts for a campaign'
      tags 'AIArtifacts'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :include, in: :query, type: :string, required: false

      response '200', 'AI artifacts list' do
        let(:include) { '' }
        run_test! do |response|
          d = JSON.parse(response.body)['data'].first
          expect(d).to have_key('id')
          expect(d).to have_key('type')
          expect(d['type']).to eq('ai_artifacts')
          expect(d['attributes']).to have_key('name')
          expect(d['attributes']).to have_key('code')
          expect(d['attributes']).to have_key('dependencies_attributes')
          expect(d['attributes']).to have_key('instructions')
          expect(d['attributes']).to have_key('include_all_datasheet_columns')

          # Test for AI assistant relationship
          expect(d).to have_key('relationships')
          expect(d['relationships']).to have_key('ai_assistant')
          expect(d['relationships']['ai_assistant']['data']['id']).to eq(ai_assistant.id.to_s)
          expect(d['relationships']['ai_assistant']['data']['type']).to eq('ai_assistants')
        end
      end

      response '200', 'AI artifacts list with included ai_assistant' do
        let(:include) { 'ai_assistant' }

        run_test! do |response|
          response_data = JSON.parse(response.body)
          d = response_data['data'].first

          # Test basic structure
          expect(d).to have_key('id')
          expect(d).to have_key('type')
          expect(d['type']).to eq('ai_artifacts')

          # Test for AI assistant relationship
          expect(d).to have_key('relationships')
          expect(d['relationships']).to have_key('ai_assistant')
          expect(d['relationships']['ai_assistant']['data']['id']).to eq(ai_assistant.id.to_s)
          expect(d['relationships']['ai_assistant']['data']['type']).to eq('ai_assistants')

          expect(response_data).to have_key('included')
          included_assistant = response_data['included'].find { |item| item['type'] == 'ai_assistants' }
          expect(included_assistant).not_to be_nil
          expect(included_assistant['id']).to eq(ai_assistant.id.to_s)
          expect(included_assistant['type']).to eq('ai_assistants')
          expect(included_assistant['attributes']).to have_key('name')
          expect(included_assistant['attributes']['name']).to eq(ai_assistant.name)
        end
      end

      response '200', 'returns only artifacts for the given campaign' do
        let!(:other_campaign) { create(:campaign) }
        let!(:other_ai_artifact) { create(:campaign_ai_artifact, campaign: other_campaign) }
        let(:include) { '' }

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          ids = data.map { |artifact| artifact['id'] }
          expect(ids.include?(other_ai_artifact.id.to_s)).to be false
        end
      end
    end

    post 'Create AI Artifact' do
      operationId 'CreateAIArtifact'
      description 'Create a new AI artifact'
      tags 'AIArtifacts'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body, required: true

      response '201', 'Create AI artifact' do
        let(:body) do
          {
            data: {
              type: 'ai_artifacts',
              attributes: {
                name: 'New Artifact',
                code: 'new_artifact',
                dependencies_attributes: {
                  campaign_factors: [],
                  questions: [],
                  sheet_columns: []
                },
                instructions: 'Instructions for the new artifact',
                include_all_datasheet_columns: false
              },
              relationships: {
                ai_assistant: {
                  data: {
                    type: 'ai_assistants',
                    id: ai_assistant.id.to_s
                  }
                },
                campaign: {
                  data: {
                    type: 'campaigns',
                    id: campaign.id.to_s
                  }
                }
              }
            }
          }
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d).to have_key('id')
          expect(d).to have_key('type')
          expect(d['type']).to eq('ai_artifacts')
          expect(d['attributes']['name']).to eq('New Artifact')
          expect(d['attributes']['code']).to eq('new_artifact')
          expect(d['attributes']['include_all_datasheet_columns']).to be false
          expect(d).to have_key('relationships')
          expect(d['relationships']).to have_key('ai_assistant')
          expect(d['relationships']['ai_assistant']['data']['id']).to eq(ai_assistant.id.to_s)
        end
      end

      response '201', 'Create AI artifact with dependencies' do
        let!(:campaign_factor) do
          create(:campaign_factor, campaign: campaign, code: 'leadership', name: 'Leadership Score')
        end
        let!(:datasheet) { create(:datasheet, campaign: campaign) }
        let!(:sheet_column) { create(:sheet_column, sheet: datasheet, name: 'name', column_type: 'string') }

        let(:body) do
          {
            data: {
              type: 'ai_artifacts',
              attributes: {
                name: 'New Artifact with Dependencies',
                code: 'new_artifact_with_deps',
                dependencies_attributes: {
                  campaign_factors: [
                    {
                      id: campaign_factor.id,
                      name: campaign_factor.name,
                      code: campaign_factor.code
                    }
                  ],
                  questions: [
                    {
                      id: question1.id,
                      text: question1.props&.dig('questionText') || question1.name,
                      assessment_id: assessment.id,
                      assessment_name: assessment.name
                    }
                  ],
                  sheet_columns: [
                    {
                      id: sheet_column.id,
                      name: sheet_column.name
                    }
                  ]
                },
                instructions: 'Instructions for the new artifact with dependencies',
                include_all_datasheet_columns: false
              },
              relationships: {
                ai_assistant: {
                  data: {
                    type: 'ai_assistants',
                    id: ai_assistant.id.to_s
                  }
                },
                campaign: {
                  data: {
                    type: 'campaigns',
                    id: campaign.id.to_s
                  }
                }
              }
            }
          }
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d).to have_key('id')
          expect(d).to have_key('type')
          expect(d['type']).to eq('ai_artifacts')
          expect(d['attributes']['name']).to eq('New Artifact with Dependencies')
          expect(d['attributes']['code']).to eq('new_artifact_with_deps')

          expect(d['attributes']['dependencies_attributes']['campaign_factors'].length).to eq(1)
          expect(d['attributes']['dependencies_attributes']['questions'].length).to eq(1)
          expect(d['attributes']['dependencies_attributes']['sheet_columns'].length).to eq(1)

          created_artifact = AI::CampaignArtifact.find(d['id'])
          expect(created_artifact.dependencies.where(dependency_type: 'CampaignFactor').count).to eq(1)
          expect(created_artifact.dependencies.where(dependency_type: 'Question').count).to eq(1)
          expect(created_artifact.dependencies.where(dependency_type: 'SheetColumn').count).to eq(1)

          expect(d).to have_key('relationships')
          expect(d['relationships']).to have_key('ai_assistant')
          expect(d['relationships']['ai_assistant']['data']['id']).to eq(ai_assistant.id.to_s)
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/ai_artifacts/{id}' do
    get 'Show AI Artifact' do
      operationId 'AIArtifact'
      description 'Fetch a specific AI artifact'
      tags 'AIArtifacts'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :id, in: :path, type: :string
      parameter name: :include, in: :query, type: :string, required: false

      response '200', 'AI artifact details' do
        let(:id) { ai_artifact.id }
        let(:include) { '' }

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d).to have_key('id')
          expect(d).to have_key('type')
          expect(d['type']).to eq('ai_artifacts')
          expect(d['attributes']).to have_key('name')
          expect(d['attributes']).to have_key('code')
          expect(d['attributes']).to have_key('dependencies_attributes')
          expect(d['attributes']).to have_key('instructions')
          expect(d['attributes']).to have_key('include_all_datasheet_columns')
          expect(d).to have_key('relationships')
          expect(d['relationships']).to have_key('ai_assistant')
          expect(d['relationships']['ai_assistant']['data']['id']).to eq(ai_assistant.id.to_s)
        end
      end

      response '200', 'AI artifact with dependencies data' do
        let(:id) { ai_artifact.id }
        let(:include) { '' }

        before do
          ai_artifact.dependencies.create!(
            dependency_type: 'Question',
            dependency_id: question1.id
          )
          ai_artifact.dependencies.create!(
            dependency_type: 'Question',
            dependency_id: question2.id
          )
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d['attributes']['dependencies_attributes']).to be_a(Hash)
          expect(d['attributes']['dependencies_attributes']['questions']).to be_an(Array)
          expect(d['attributes']['dependencies_attributes']['questions'].length).to eq(2)

          questions_data = d['attributes']['dependencies_attributes']['questions']
          question_ids = questions_data.map { |q| q['id'] }
          expect(question_ids).to contain_exactly(question1.id.to_s, question2.id.to_s)

          question1_data = questions_data.find { |q| q['id'] == question1.id.to_s }
          expect(question1_data['question_text']).to eq('What is your favorite color?')
          expect(question1_data['assessment_id']).to eq(assessment.id.to_s)
          expect(question1_data['assessment_name']).to eq(assessment.name)

          question2_data = questions_data.find { |q| q['id'] == question2.id.to_s }
          expect(question2_data['question_text']).to eq('Please describe your experience.')
          expect(question2_data['assessment_id']).to eq(assessment.id.to_s)
          expect(question2_data['assessment_name']).to eq(assessment.name)
        end
      end

      response '200', 'AI artifact with deep includes' do
        let(:id) { ai_artifact.id }
        let(:include) { 'ai_assistant.assistant_output_schema_keys' }
        let!(:expected_schema_keys) { ai_assistant.assistant_output_schema_keys }

        run_test! do |response|
          response_data = JSON.parse(response.body)

          included_assistant = response_data['included'].find { |item| item['type'] == 'ai_assistants' }
          expect(included_assistant).not_to be_nil
          expect(included_assistant['id']).to eq(ai_assistant.id.to_s)
          expect(included_assistant['attributes']).to have_key('name')
          expect(included_assistant).to have_key('relationships')
          expect(included_assistant['relationships']).to have_key('assistant_output_schema_keys')

          schema_keys = response_data['included'].select { |item| item['type'] == 'assistant_output_schema_keys' }
          expect(schema_keys).not_to be_empty
          expect(schema_keys.pluck('id').sort).to eq(expected_schema_keys.pluck(:id).sort.map(&:to_s))
          expect(schema_keys.first['attributes']).to have_key('key')
          expect(schema_keys.first['attributes']).to have_key('description')
          expect(schema_keys.first['attributes']).to have_key('key_type')
        end
      end
    end

    patch 'Update AI Artifact' do
      operationId 'AIArtifact'
      description 'Update AI artifact'
      tags 'AIArtifacts'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :id, in: :path, type: :string
      parameter name: :body, in: :body

      response '200', 'Update AI artifact' do
        let(:id) { ai_artifact.id }
        let!(:new_ai_assistant) { create(:assistant, name: 'New AI Assistant') }

        let(:body) do
          {
            data: {
              id: id.to_s,
              type: 'ai_artifacts',
              attributes: {
                name: 'Updated Artifact Name',
                code: 'updated_artifact',
                dependencies_attributes: {
                  campaign_factors: [],
                  questions: [],
                  sheet_columns: []
                },
                instructions: 'Updated instructions',
                include_all_datasheet_columns: true
              },
              relationships: {
                ai_assistant: {
                  data: {
                    type: 'ai_assistants',
                    id: new_ai_assistant.id.to_s
                  }
                }
              }
            }
          }
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d).to have_key('id')
          expect(d).to have_key('type')
          expect(d['type']).to eq('ai_artifacts')
          expect(d['attributes']['name']).to eq('Updated Artifact Name')
          expect(d['attributes']['code']).to eq('updated_artifact')
          expect(d['attributes']['include_all_datasheet_columns']).to be true
          expect(d).to have_key('relationships')
          expect(d['relationships']).to have_key('ai_assistant')

          expect(d['relationships']['ai_assistant']['data']['id']).to eq(new_ai_assistant.id.to_s)

          updated_artifact = AI::CampaignArtifact.find(id)
          expect(updated_artifact.ai_assistant_id).to eq(new_ai_assistant.id)
        end
      end

      response '200', 'Update AI artifact with nil dependencies (no change)' do
        let(:id) { ai_artifact.id }

        before do
          ai_artifact.dependencies.create!(dependency_type: 'Question', dependency_id: question1.id)
          ai_artifact.dependencies.create!(dependency_type: 'Question', dependency_id: question2.id)
        end

        let(:body) do
          {
            data: {
              id: id.to_s,
              type: 'ai_artifacts',
              attributes: {
                name: 'Updated with Nil Dependencies',
                dependencies_attributes: nil
              }
            }
          }
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d['attributes']['name']).to eq('Updated with Nil Dependencies')

          # Verify existing dependencies are unchanged
          updated_artifact = AI::CampaignArtifact.find(id)
          question_dependencies = updated_artifact.dependencies.where(dependency_type: 'Question')
          expect(question_dependencies.count).to eq(2)
          expect(question_dependencies.pluck(:dependency_id)).to contain_exactly(question1.id, question2.id)
        end
      end

      response '200', 'Update AI artifact with valid dependencies' do
        let(:id) { ai_artifact.id }
        let(:valid_dependencies) do
          {
            campaign_factors: [],
            questions: [
              {
                id: question1.id,
                text: question1.props&.dig('questionText') || question1.name,
                assessment_id: assessment.id,
                assessment_name: assessment.name
              },
              {
                id: question2.id,
                text: question2.props&.dig('questionText') || question2.name,
                assessment_id: assessment.id,
                assessment_name: assessment.name
              }
            ],
            sheet_columns: []
          }
        end

        let(:body) do
          {
            data: {
              id: id.to_s,
              type: 'ai_artifacts',
              attributes: {
                name: 'Updated with Dependencies',
                dependencies_attributes: valid_dependencies
              }
            }
          }
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d['attributes']['name']).to eq('Updated with Dependencies')
          expect(d['attributes']['dependencies_attributes']).to be_a(Hash)
          expect(d['attributes']['dependencies_attributes']['questions']).to be_an(Array)
          expect(d['attributes']['dependencies_attributes']['questions'].length).to eq(2)

          questions_data = d['attributes']['dependencies_attributes']['questions']
          question_ids = questions_data.map { |q| q['id'] }
          expect(question_ids).to contain_exactly(question1.id.to_s, question2.id.to_s)

          updated_artifact = AI::CampaignArtifact.find(id)

          question_dependencies = updated_artifact.dependencies.where(dependency_type: 'Question')
          expect(question_dependencies.count).to eq(2)
          expect(question_dependencies.pluck(:dependency_id)).to contain_exactly(question1.id, question2.id)
        end
      end

      response '200', 'Update AI artifact removing existing dependencies' do
        let(:id) { ai_artifact.id }

        before do
          ai_artifact.dependencies.create!(dependency_type: 'Question', dependency_id: question1.id)
          ai_artifact.dependencies.create!(dependency_type: 'Question', dependency_id: question2.id)
        end

        let(:body) do
          {
            data: {
              id: id.to_s,
              type: 'ai_artifacts',
              attributes: {
                name: 'Updated with Empty Dependencies',
                dependencies_attributes: {
                  campaign_factors: [],
                  questions: [],
                  sheet_columns: []
                }
              }
            }
          }
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d['attributes']['name']).to eq('Updated with Empty Dependencies')
          expect(d['attributes']['dependencies_attributes']).to be_a(Hash)
          expect(d['attributes']['dependencies_attributes']['questions']).to be_an(Array)
          expect(d['attributes']['dependencies_attributes']['questions'].length).to eq(0)

          updated_artifact = AI::CampaignArtifact.find(id)
          question_dependencies = updated_artifact.dependencies.where(dependency_type: 'Question')
          expect(question_dependencies.count).to eq(0)
        end
      end

      response '200', 'Update AI artifact replacing dependencies' do
        let(:id) { ai_artifact.id }

        before do
          ai_artifact.dependencies.create!(dependency_type: 'Question', dependency_id: question1.id)
          ai_artifact.dependencies.create!(dependency_type: 'Question', dependency_id: question2.id)
        end

        let(:body) do
          {
            data: {
              id: id.to_s,
              type: 'ai_artifacts',
              attributes: {
                name: 'Updated with Replaced Dependencies',
                dependencies_attributes: {
                  campaign_factors: [],
                  questions: [
                    {
                      id: question2.id,
                      text: question2.props&.dig('questionText') || question2.name,
                      assessment_id: assessment.id,
                      assessment_name: assessment.name
                    }
                  ],
                  sheet_columns: []
                }
              }
            }
          }
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d['attributes']['name']).to eq('Updated with Replaced Dependencies')
          expect(d['attributes']['dependencies_attributes']['questions'].length).to eq(1)

          questions_data = d['attributes']['dependencies_attributes']['questions']
          expect(questions_data.first['id']).to eq(question2.id.to_s)

          # Verify only question2 dependency exists in database
          updated_artifact = AI::CampaignArtifact.find(id)
          question_dependencies = updated_artifact.dependencies.where(dependency_type: 'Question')
          expect(question_dependencies.count).to eq(1)
          expect(question_dependencies.first.dependency_id).to eq(question2.id)
        end
      end

      response '200', 'Update AI artifact with campaign factors dependencies' do
        let(:id) { ai_artifact.id }
        let!(:campaign_factor1) do
          create(:campaign_factor, campaign: campaign, code: 'leadership', name: 'Leadership Score')
        end
        let!(:campaign_factor2) do
          create(:campaign_factor, campaign: campaign, code: 'communication', name: 'Communication Rating')
        end

        let(:body) do
          {
            data: {
              id: id.to_s,
              type: 'ai_artifacts',
              attributes: {
                name: 'Updated with Campaign Factors',
                dependencies_attributes: {
                  campaign_factors: [
                    {
                      id: campaign_factor1.id,
                      name: campaign_factor1.name,
                      code: campaign_factor1.code
                    },
                    {
                      id: campaign_factor2.id,
                      name: campaign_factor2.name,
                      code: campaign_factor2.code
                    }
                  ],
                  questions: [],
                  sheet_columns: []
                }
              }
            }
          }
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d['attributes']['dependencies_attributes']['campaign_factors'].length).to eq(2)

          factors_data = d['attributes']['dependencies_attributes']['campaign_factors']
          factor_ids = factors_data.map { |f| f['id'] }
          expect(factor_ids).to contain_exactly(campaign_factor1.id, campaign_factor2.id)

          # Verify dependencies were created in database
          updated_artifact = AI::CampaignArtifact.find(id)
          factor_dependencies = updated_artifact.dependencies.where(dependency_type: 'CampaignFactor')
          expect(factor_dependencies.count).to eq(2)
          expect(factor_dependencies.pluck(:dependency_id)).to contain_exactly(campaign_factor1.id, campaign_factor2.id)
        end
      end

      response '200', 'Update AI artifact with sheet columns dependencies' do
        let(:id) { ai_artifact.id }
        let!(:datasheet) { create(:datasheet, campaign: campaign) }
        let!(:sheet_column1) { create(:sheet_column, sheet: datasheet, name: 'name', column_type: 'string') }
        let!(:sheet_column2) { create(:sheet_column, sheet: datasheet, name: 'department', column_type: 'string') }

        let(:body) do
          {
            data: {
              id: id.to_s,
              type: 'ai_artifacts',
              attributes: {
                name: 'Updated with Sheet Columns',
                dependencies_attributes: {
                  campaign_factors: [],
                  questions: [],
                  sheet_columns: [
                    {
                      id: sheet_column1.id,
                      name: sheet_column1.name
                    },
                    {
                      id: sheet_column2.id,
                      name: sheet_column2.name
                    }
                  ]
                }
              }
            }
          }
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d['attributes']['dependencies_attributes']['sheet_columns'].length).to eq(2)

          columns_data = d['attributes']['dependencies_attributes']['sheet_columns']
          column_ids = columns_data.map { |c| c['id'] }
          expect(column_ids).to contain_exactly(sheet_column1.id, sheet_column2.id)

          # Verify dependencies were created in database
          updated_artifact = AI::CampaignArtifact.find(id)
          column_dependencies = updated_artifact.dependencies.where(dependency_type: 'SheetColumn')
          expect(column_dependencies.count).to eq(2)
          expect(column_dependencies.pluck(:dependency_id)).to contain_exactly(sheet_column1.id, sheet_column2.id)
        end
      end

      response '200', 'Update AI artifact with mixed dependencies' do
        let(:id) { ai_artifact.id }
        let!(:campaign_factor) do
          create(:campaign_factor, campaign: campaign, code: 'leadership', name: 'Leadership Score')
        end
        let!(:datasheet) { create(:datasheet, campaign: campaign) }
        let!(:sheet_column) { create(:sheet_column, sheet: datasheet, name: 'name', column_type: 'string') }

        let(:body) do
          {
            data: {
              id: id.to_s,
              type: 'ai_artifacts',
              attributes: {
                name: 'Updated with Mixed Dependencies',
                dependencies_attributes: {
                  campaign_factors: [
                    {
                      id: campaign_factor.id,
                      name: campaign_factor.name,
                      code: campaign_factor.code
                    }
                  ],
                  questions: [
                    {
                      id: question1.id,
                      text: question1.props&.dig('questionText') || question1.name,
                      assessment_id: assessment.id,
                      assessment_name: assessment.name
                    }
                  ],
                  sheet_columns: [
                    {
                      id: sheet_column.id,
                      name: sheet_column.name
                    }
                  ]
                }
              }
            }
          }
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d['attributes']['dependencies_attributes']['campaign_factors'].length).to eq(1)
          expect(d['attributes']['dependencies_attributes']['questions'].length).to eq(1)
          expect(d['attributes']['dependencies_attributes']['sheet_columns'].length).to eq(1)

          # Verify all types of dependencies were created in database
          updated_artifact = AI::CampaignArtifact.find(id)
          expect(updated_artifact.dependencies.where(dependency_type: 'CampaignFactor').count).to eq(1)
          expect(updated_artifact.dependencies.where(dependency_type: 'Question').count).to eq(1)
          expect(updated_artifact.dependencies.where(dependency_type: 'SheetColumn').count).to eq(1)
        end
      end
    end

    delete 'Delete AI Artifact' do
      operationId 'AIArtifact'
      description 'Delete AI artifact'
      tags 'AIArtifacts'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :id, in: :path, type: :string

      response '204', 'Delete AI artifact' do
        let(:id) { ai_artifact.id }

        run_test! do |response|
          expect(response.status).to eq(204)
          expect(response.body).to be_empty
          expect(AI::CampaignArtifact.exists?(id)).to be false
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/ai_artifacts/{id}/generate' do
    post 'Generate AI Artifact Results' do
      operationId 'GenerateAIArtifactResults'
      description 'Generate AI artifact results for a specific user'
      tags 'AIArtifacts'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :id, in: :path, type: :string
      parameter name: :body, in: :body, schema: {
        type: :object,
        properties: {
          query: {
            type: :object,
            properties: {
              user_id: { type: :string }
            },
            required: ['user_id']
          }
        },
        required: ['query']
      }, required: true

      response '200', 'AI artifact results generated successfully' do
        let(:id) { ai_artifact.id }
        let(:body) do
          {
            query: {
              user_id: user.id.to_s
            }
          }
        end
        let(:results) do
          { results: { 'summary' => 'This is latest generated', 'feedback' => 'Average' },
            parsed_dependencies: 'Some dependencies' }
        end

        before do
          stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :ok, results)
          ai_artifact.results.find_by(user: user).update!(results: results[:results],
                                                          parsed_dependencies: results[:parsed_dependencies])
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d).to have_key('id')
          expect(d).to have_key('type')
          expect(d['type']).to eq('campaign_ai_artifact_results')
          expect(d['attributes']).to have_key('results')
          expect(d['attributes']['results']).to be_an(Array)
          expect(d['attributes']['results']).to contain_exactly(
            { 'key' => 'summary', 'type' => 'string', 'value' => 'This is latest generated' },
            { 'key' => 'feedback', 'type' => 'string', 'value' => 'Average' }
          )
          expect(d['attributes']['parsed_dependencies']).to eq(results[:parsed_dependencies])
        end
      end

      response '422', 'AI artifact results generation failed' do
        let(:id) { ai_artifact.id }
        let(:body) do
          {
            query: {
              user_id: user.id.to_s
            }
          }
        end

        before do
          stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :error, 'There was an error')
        end

        run_test! do |response|
          expect(response.status).to eq(422)
          errors = JSON.parse(response.body)['errors']
          expect(errors).to be_an(Array)
          expect(errors.first['detail']).to eq('There was an error')
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/ai_artifacts/{id}/test_generate' do
    post 'Test Generate AI Artifact Results' do
      operationId 'TestGenerateAIArtifactResults'
      description 'Test generate AI artifact results with custom test data'
      tags 'AIArtifacts'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :id, in: :path, type: :string
      parameter name: :body, in: :body, schema: {
        type: :object,
        properties: {
          data: {
            type: :object,
            properties: {
              attributes: {
                type: :object,
                properties: {
                  test_data: {
                    type: :object,
                    description: 'Custom test data to use instead of parsed user data'
                  }
                },
                required: ['test_data']
              }
            },
            required: ['attributes']
          }
        },
        required: ['data']
      }, required: true

      response '200', 'AI artifact test results generated successfully' do
        let(:id) { ai_artifact.id }
        let(:test_data) { { 'name' => 'John Doe', 'score' => 85 } }
        let(:body) do
          {
            data: {
              attributes: {
                test_data: test_data
              }
            }
          }
        end
        let(:results) do
          { results: { 'summary' => 'Test generated summary', 'feedback' => 'Test feedback' },
            parsed_dependencies: 'Test dependencies' }
        end

        before do
          stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :ok, results)
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d).to have_key('type')
          expect(d['type']).to eq('campaign_ai_artifact_results')
          expect(d['attributes']).to have_key('results')
          expect(d['attributes']['results']).to be_an(Array)
          expect(d['attributes']['results']).to contain_exactly(
            { 'key' => 'summary', 'type' => 'string', 'value' => 'Test generated summary' },
            { 'key' => 'feedback', 'type' => 'string', 'value' => 'Test feedback' }
          )
          expect(d['attributes']).to have_key('parsed_dependencies')
          expect(d['attributes']['parsed_dependencies']).to eq(results[:parsed_dependencies])
        end
      end

      response '200', 'AI artifact test results with correct test data passed to generator' do
        let(:id) { ai_artifact.id }
        let(:test_data) { { 'name' => 'Jane Smith', 'age' => 30, 'score' => 92 } }
        let(:body) do
          {
            data: {
              attributes: {
                test_data: test_data
              }
            }
          }
        end
        let(:results) do
          { results: { 'summary' => 'Test generated summary', 'feedback' => 'Excellent' },
            parsed_dependencies: 'Test dependencies' }
        end

        before do
          allow(AI::CampaignArtifacts::ResultGenerator).to receive(:new) do |artifact, user, options|
            expect(artifact).to eq(ai_artifact)
            expect(user).to be_nil
            expect(options).to include(
              test_mode: true,
              test_data: test_data,
              current_user: superadmin
            )

            double('ResultGenerator').tap do |mock|
              allow(mock).to receive(:on).and_return(mock)
              allow(mock).to receive(:call)
            end
          end

          stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :ok, results)
        end

        run_test! do |response|
          d = JSON.parse(response.body)['data']
          expect(d).to have_key('type')
          expect(d['type']).to eq('campaign_ai_artifact_results')
          expect(d['attributes']).to have_key('results')
          expect(d['attributes']['results']).to be_an(Array)
          expect(d['attributes']['results']).to contain_exactly(
            { 'key' => 'summary', 'type' => 'string', 'value' => 'Test generated summary' },
            { 'key' => 'feedback', 'type' => 'string', 'value' => 'Excellent' }
          )
        end
      end

      response '422', 'AI artifact test results generation failed' do
        let(:id) { ai_artifact.id }
        let(:body) do
          {
            data: {
              attributes: {
                test_data: { 'invalid' => 'data' }.to_s
              }
            }
          }
        end

        before do
          stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :error, 'Test generation error')
        end

        run_test! do |response|
          expect(response.status).to eq(422)
          errors = JSON.parse(response.body)['errors']
          expect(errors).to be_an(Array)
          expect(errors.first['detail']).to eq('Test generation error')
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/ai_artifacts/bulk_generate' do
    post 'Bulk Generate AI Artifact Results' do
      operationId 'BulkGenerateAIArtifactResults'
      description 'Bulk generate AI artifact results for users in a campaign'
      tags 'AIArtifacts'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: {
        type: :object,
        properties: {
          data: {
            type: :object,
            properties: {
              type: { type: :string, example: 'campaign_users' },
              attributes: {
                type: :object,
                properties: {
                  user_ids: { type: :array, items: { type: :integer } }
                }
              }
            }
          }
        },
        required: ['data']
      }, required: true

      response '200', 'Bulk generate job triggered' do
        let(:campaign_id) { campaign.id }
        let(:user_ids) { [campaign_user.user_id] }
        let(:body) do
          {
            data: {
              type: 'campaign_users',
              attributes: {
                user_ids: user_ids
              }
            }
          }
        end

        run_test! do |_response|
          job = AdminJobRecord.last
          expect(job.operation).to eq('bulk_generate_user_campaign_ai_artifact_results')
          expect(job.data).to eq({
            'user_ids' => user_ids,
            'campaign_id' => campaign.id
          })
        end
      end
    end
  end
end

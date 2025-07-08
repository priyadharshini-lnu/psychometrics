# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

RSpec.describe 'Api::V2::Administration::ProficiencyLevelsController',
               swagger_doc: 'v2/swagger.json',
               type: :request do
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:project_id) { project.id }
  let!(:superadmin) { create(:superadmin) }
  let!(:skill) { create(:skill, name: 'Skill') }
  let!(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before(:each) do
    sign_in(superadmin)
  end

  after(:each) do
    sign_out(superadmin)
  end

  path '/proficiency_levels' do
    post 'Creates a Proficiency Level' do
      operationId 'CreateProficiencyLevel'
      description 'Create a new Proficiency Level'
      tags 'ProficiencyLevel'
      consumes 'application/vnd.api+json'
      security [basic: []]

      parameter name: :body, in: :body, required: true, schema: {
        type: :object,
        properties: {
          data: {
            type: :object,
            properties: {
              type: { type: :string },
              attributes: {
                type: :object,
                properties: {
                  proficiency_type: { type: :string },
                  skill_type: { type: :string },
                  level: { type: :integer },
                  level_definition: {
                    type: :array,
                    items: {
                      type: :object,
                      properties: {
                        level: { type: :integer },
                        name: { type: :string },
                        description: { type: :string }
                      },
                      required: %w[level name description]
                    }
                  }
                },
                required: %w[proficiency_type skill_type level level_definition]
              },
              relationships: {
                type: :object,
                properties: {
                  project: {
                    type: :object,
                    properties: {
                      data: {
                        type: :object,
                        properties: {
                          type: { type: :string },
                          id: { type: :string }
                        },
                        required: %w[type id]
                      }
                    },
                    required: ['data']
                  },
                  skill: {
                    type: :object,
                    properties: {
                      data: {
                        type: :object,
                        properties: {
                          type: { type: :string },
                          id: { type: :string }
                        },
                        required: %w[type id]
                      }
                    },
                    required: ['data']
                  }
                },
                required: %w[project skill]
              }
            },
            required: %w[type attributes relationships]
          }
        },
        required: ['data']
      }

      response '201', 'Proficiency Level Created' do
        schema type: :object,
               properties: {
                 data: {
                   type: :object,
                   properties: {
                     id: { type: :string },
                     type: { type: :string },
                     attributes: {
                       type: :object,
                       properties: {
                         proficiency_type: { type: :string },
                         skill_type: { type: :string },
                         level: { type: :integer },
                         level_definition: {
                           type: :array,
                           items: {
                             type: :object,
                             properties: {
                               level: { type: :integer },
                               name: { type: :string },
                               description: { type: :string }
                             },
                             required: %w[level name description]
                           }
                         }
                       }
                     }
                   }
                 }
               }

        let(:body) do
          {
            data: {
              type: 'proficiency_levels',
              attributes: {
                proficiency_type: 'by_skill',
                skill_type: 'other',
                level: 3,
                level_definition: [
                  {
                    level: 1,
                    name: 'Awareness',
                    description: 'Awareness Description'
                  },
                  {
                    level: 2,
                    name: 'Developing',
                    description: 'Developing Description'
                  },
                  {
                    level: 3,
                    name: 'Developed',
                    description: 'Developed Description'
                  }
                ]
              },
              relationships: {
                project: {
                  data: {
                    type: 'clients',
                    id: project_id.to_s
                  }
                },
                skill: {
                  data: {
                    type: 'skills',
                    id: skill.id.to_s
                  }
                }
              }
            }
          }
        end

        run_test! do |response|
          expect(response.status).to eq(201)
        end
      end
    end
  end
end

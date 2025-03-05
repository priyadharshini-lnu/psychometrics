# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::CampaignTemplatesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:owner) { create(:tenancy) }
  let!(:assessment) { create(:assessment, :with_same_owner_dimension, owner:, created_by: superadmin) }
  let(:report) { create(:report, assessments: [assessment], owner:, created_by: superadmin) }
  let!(:campaign_template) { create(:campaign_template, assessment: assessment, report: report, owner: owner) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/campaign_templates/' do
    get 'Campaign Templates List' do
      operationId 'CampaignTemplatesList'

      description 'Fetch Campaign Templates list'
      tags 'Campaign Templates'
      consumes 'application/json'
      security [basic: []]

      response '200', 'Campaign Templates list' do
        schema '$ref' => '#/components/schemas/CampaignTemplateListResponse'

        examples 'application/json' => [{
          type: 'campaign_templates',
          data: {
            id: '770',
            attributes: {
              name: 'Campaign Template Name',
              owner: {
                id: '1',
                name: 'TTE'
              },
              assessment: {
                id: '1',
                name: 'Assessment 1'
              },
              report: {
                id: '1',
                name: 'Report 1'
              }
            }
          }
        }]

        run_test! do |response|
          campaign_templates = JSON.parse(response.body)
          campaign_templates_response = campaign_templates['data'].find { |c| c['id'] == campaign_template.id.to_s }
          expect(campaign_templates_response).to have_key('id')
          expect(campaign_templates_response).to have_attribute(:name).with_value(campaign_template.name)
          expect(campaign_templates_response).to have_relationship(:assessment).
            with_data({ 'id' => campaign_template.assessment.id.to_s, 'type' => 'assessments' })
        end
      end
    end

    post 'Create a Campaign Template' do
      operationId 'CampaignTemplate'
      description 'Create new Campaign Template'
      tags 'CampaignTemplates'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/CampaignTemplateCreateRequest' },
                required: true

      response '201', 'Campaign Template Created' do
        schema '$ref' => '#/components/schemas/CampaignTemplateResponse'
        examples 'application/json' => {
          data: {
            type: 'campaign_templates',
            id: '20',
            attributes: {
              name: 'Campaign Template Name'
            },
            relationships: {
              owner: {
                data: {
                  type: 'clients',
                  id: '100'
                }
              },
              report: {
                data: {
                  type: 'reports',
                  id: '100'
                }
              },
              assessment: {
                data: {
                  type: 'assessments',
                  id: '100'
                }
              }
            }
          }
        }

        let!(:owner_new) { create(:tenancy, name: 'New Client') }
        let!(:assessment_new) do
          create(:assessment, :with_same_owner_dimension, name: 'New Assessmen', owner: owner_new,
            skip_owner_validation: true)
        end
        let(:report_new) do
          create(:report, assessments: [assessment], name: 'New Report', owner: owner_new, skip_owner_validation: true)
        end

        let(:body) do
          {
            data: {
              type: 'campaign_templates',
              attributes: {
                name: 'New Name'
              },
              relationships: {
                owner: {
                  data: {
                    type: 'clients',
                    id: owner_new.id.to_s
                  }
                },
                report: {
                  data: {
                    type: 'reports',
                    id: report_new.id.to_s
                  }
                },
                assessment: {
                  data: {
                    type: 'assessments',
                    id: assessment_new.id.to_s
                  }
                }
              }
            }
          }
        end

        run_test! do |response|
          campaign_template = JSON.parse(response.body)['data']
          expect(campaign_template).to have_key('id')
          expect(campaign_template).to have_attribute(:name).with_value('New Name')
          expect(campaign_template).to have_relationship(:assessment).
            with_data({ 'id' => assessment_new.id.to_s, 'type' => 'assessments' })
          expect(campaign_template).to have_relationship(:owner).
            with_data({ 'id' => owner_new.id.to_s, 'type' => 'clients' })
          expect(campaign_template).to have_relationship(:report).
            with_data({ 'id' => report_new.id.to_s, 'type' => 'reports' })
        end
      end
    end
  end

  path '/campaign_templates/{campaign_template_id}' do
    patch 'Update a campaign template' do
      operationId 'CampaignTemplate'
      description 'Update a Campaign Template'
      tags 'Campaign Templates'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_template_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: {
        '$ref' => '#/components/schemas/CampaignTemplateUpdateRequest'
      }, required: true

      response '200', 'Campaign Template Updated' do
        schema '$ref' => '#/components/schemas/CampaignTemplateResponse'
        examples 'application/json' => {
          data: {
            type: 'campaign_templates',
            id: '20',
            attributes: {
              name: 'Campaign Template Name'
            },
            relationships: {
              owner: {
                data: {
                  type: 'clients',
                  id: '100'
                }
              },
              report: {
                data: {
                  type: 'reports',
                  id: '100'
                }
              },
              assessment: {
                data: {
                  type: 'assessments',
                  id: '100'
                }
              }
            }
          }
        }

        let!(:owner_new) { create(:tenancy, name: 'New Client') }
        let!(:assessment_new) do
          create(:assessment, :with_same_owner_dimension, name: 'New Assessmen', owner: owner_new,
           skip_owner_validation: true)
        end
        let(:report_new) do
          create(:report, assessments: [assessment], name: 'New Report', owner: owner_new, skip_owner_validation: true)
        end
        let!(:campaign_template) do
          create(:campaign_template, name: 'Old Name', assessment: assessment, report: report, owner: owner)
        end
        let!(:campaign_template_id) { campaign_template.id }

        let(:body) do
          {
            data: {
              type: 'campaign_templates',
              id: campaign_template_id.to_s,
              attributes: {
                name: 'New Name'
              },
              relationships: {
                owner: {
                  data: {
                    type: 'clients',
                    id: owner_new.id.to_s
                  }
                },
                report: {
                  data: {
                    type: 'reports',
                    id: report_new.id.to_s
                  }
                },
                assessment: {
                  data: {
                    type: 'assessments',
                    id: assessment_new.id.to_s
                  }
                }
              }
            }
          }
        end

        run_test! do |response|
          campaign_template = JSON.parse(response.body)['data']
          expect(campaign_template).to have_key('id')
          expect(campaign_template).to have_attribute(:name).with_value('New Name')
          expect(campaign_template).to have_relationship(:assessment).
            with_data({ 'id' => assessment_new.id.to_s, 'type' => 'assessments' })
          expect(campaign_template).to have_relationship(:owner).
            with_data({ 'id' => owner_new.id.to_s, 'type' => 'clients' })
          expect(campaign_template).to have_relationship(:report).
            with_data({ 'id' => report_new.id.to_s, 'type' => 'reports' })
        end
      end
    end

    delete 'Delete a Campaign Template' do
      operationId 'DeleteCampaignTemplate'
      description 'Delete a Campaign Template'
      tags 'Clients'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_template_id, in: :path, type: :string

      let!(:campaign_template) { create(:campaign_template, assessment: assessment, report: report, owner: owner) }
      let!(:campaign_template_id) { campaign_template.id }

      response '204', 'Campaign Template Deleted' do
        run_test! do |response|
          expect(response.body).to be_empty
          expect(CampaignTemplate.find_by(id: campaign_template_id)).to eq(nil)
        end
      end
    end
  end
end

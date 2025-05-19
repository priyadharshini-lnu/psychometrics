# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::IdpTemplate::Contract do
  let(:user) { create(:user) }
  let(:project) { create(:project) }
  let(:idp_template) { create(:idp_template, project: project) }
  let(:behavioral_global_skill) { create(:skill, category: :behavioral, project_id: nil) }
  let(:technical_global_skill) { create(:skill, category: :technical, project_id: nil) }
  let(:behavioural_client_skill) { create(:skill, category: :behavioral, project_id: project.id) }
  let(:technical_client_skill) { create(:skill, category: :technical, project_id: project.id) }

  let(:params) do
    jsonapi_resource_request(
      'idp_templates',
      {
        id: idp_template.id,
        name: 'test',
        self_rating_enabled: true,
        description: 'test',
        behavioural_global_tags: [],
        behavioural_client_tags: [],
        technical_global_tags: [],
        technical_client_tags: [],
        behavioral_global_skill_settings: 'selected',
        behavioral_client_skill_settings: 'none',
        technical_global_skill_settings: 'none',
        technical_client_skill_settings: 'none',
        title_text: nil,
        subtitle_text: nil,
        logo_type: 'both'
      },
      {
        skills: [
          {
            type: 'skills',
            id: behavioral_global_skill.id.to_s
          }
        ],
        project: {
          id: project.id.to_s,
          type: 'clients'
        },
        report: {
          id: '10',
          type: 'reports'
        }
      }
    )
  end

  let(:contract) do
    Api::V2::IdpTemplate::Contract.new(
      schema: Api::V2::IdpTemplate::Schema.create_request
    )
  end

  describe 'validations' do
    context 'when no skill settings are selected' do
      it 'does not validate tags or skills' do
        params[:data][:attributes][:behavioral_global_skill_settings] = 'none'
        params[:data][:attributes][:behavioral_client_skill_settings] = 'none'
        params[:data][:attributes][:technical_global_skill_settings] = 'none'
        params[:data][:attributes][:technical_client_skill_settings] = 'none'
        params[:data][:attributes][:behavioral_global_tags] = []
        params[:data][:attributes][:behavioral_client_tags] = []
        params[:data][:attributes][:technical_global_tags] = []
        params[:data][:attributes][:technical_client_tags] = []
        params[:data][:relationships][:skills][:data] = []

        schema = contract.call(params, { idp_template: idp_template })
        expect(schema.failure?).to eq(false)
      end
    end

    context 'when no tags or skills are provided' do
      it 'validates that at least one tag or skill is provided' do
        params[:data][:attributes][:behavioral_global_skill_settings] = 'selected'
        params[:data][:attributes][:behavioral_client_skill_settings] = 'selected'
        params[:data][:attributes][:technical_global_skill_settings] = 'selected'
        params[:data][:attributes][:technical_client_skill_settings] = 'selected'
        params[:data][:attributes][:behavioural_global_tags] = []
        params[:data][:attributes][:behavioral_client_tags] = []
        params[:data][:attributes][:technical_global_tags] = []
        params[:data][:attributes][:technical_client_tags] = []
        params[:data][:relationships][:skills][:data] = []

        schema = contract.call(params, { idp_template: idp_template })

        expect(schema.failure?).to eq(true)
        expect(schema).to have_jsonapi_attr_error(
          { behavioral_global_skill_settings: [I18n.t('dry_errors.errors.idp_template.tag_or_skill_required')] }
        )
        expect(schema).to have_jsonapi_attr_error(
          { behavioral_client_skill_settings: [I18n.t('dry_errors.errors.idp_template.tag_or_skill_required')] }
        )
        expect(schema).to have_jsonapi_attr_error(
          { technical_global_skill_settings: [I18n.t('dry_errors.errors.idp_template.tag_or_skill_required')] }
        )
        expect(schema).to have_jsonapi_attr_error(
          { technical_client_skill_settings: [I18n.t('dry_errors.errors.idp_template.tag_or_skill_required')] }
        )
      end
    end

    context 'when tags are provided' do
      it 'does not validate skills' do
        params[:data][:attributes][:behavioral_global_skill_settings] = 'selected'
        params[:data][:attributes][:behavioral_client_skill_settings] = 'selected'
        params[:data][:attributes][:technical_global_skill_settings] = 'selected'
        params[:data][:attributes][:technical_client_skill_settings] = 'selected'
        params[:data][:attributes][:behavioural_global_tags] = ['tag1']
        params[:data][:attributes][:behavioural_client_tags] = ['tag2']
        params[:data][:attributes][:technical_global_tags] = ['tag3']
        params[:data][:attributes][:technical_client_tags] = ['tag4']
        params[:data][:relationships][:skills][:data] = []

        schema = contract.call(params, { idp_template: idp_template })

        expect(schema.failure?).to eq(false)
      end
    end

    context 'when skills are provided' do
      it 'does not validate tags' do
        params[:data][:attributes][:behavioral_global_skill_settings] = 'selected'
        params[:data][:attributes][:behavioral_client_skill_settings] = 'none'
        params[:data][:attributes][:technical_global_skill_settings] = 'none'
        params[:data][:attributes][:technical_client_skill_settings] = 'none'
        params[:data][:relationships][:skills][:data] = [
          {
            type: 'skills',
            id: behavioral_global_skill.id.to_s
          },
          {
            type: 'skills',
            id: technical_global_skill.id.to_s
          },
          {
            type: 'skills',
            id: behavioural_client_skill.id.to_s
          },
          {
            type: 'skills',
            id: technical_client_skill.id.to_s
          }
        ]
        params[:data][:attributes][:behavioural_global_tags] = []
        params[:data][:attributes][:behavioural_client_tags] = []
        params[:data][:attributes][:technical_global_tags] = []
        params[:data][:attributes][:technical_client_tags] = []

        schema = contract.call(params, { idp_template: idp_template })

        expect(schema.failure?).to eq(false)
      end
    end

    context 'when tags and skills are provided' do
      it 'does not validate' do
        params[:data][:attributes][:behavioral_global_skill_settings] = 'selected'
        params[:data][:attributes][:behavioral_client_skill_settings] = 'selected'
        params[:data][:attributes][:technical_global_skill_settings] = 'selected'
        params[:data][:attributes][:technical_client_skill_settings] = 'selected'
        params[:data][:relationships][:skills][:data] = [
          {
            type: 'skills',
            id: behavioral_global_skill.id.to_s
          },
          {
            type: 'skills',
            id: technical_global_skill.id.to_s
          },
          {
            type: 'skills',
            id: behavioural_client_skill.id.to_s
          },
          {
            type: 'skills',
            id: technical_client_skill.id.to_s
          }
        ]
        params[:data][:attributes][:behavioural_global_tags] = ['tag1']
        params[:data][:attributes][:behavioural_client_tags] = ['tag2']
        params[:data][:attributes][:technical_global_tags] = ['tag3']
        params[:data][:attributes][:technical_client_tags] = ['tag4']

        schema = contract.call(params, { idp_template: idp_template })

        expect(schema.failure?).to eq(false)
      end
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::DevelopmentAction::Contract do
  let(:user) { create(:user) }
  let(:project) { create(:project) }
  let(:skill1) { create(:skill, skill_type: :behavioral, project_id: nil) }
  let(:skill2) { create(:skill, skill_type: :technical, project_id: nil) }
  let(:skill3) { create(:skill, skill_type: :behavioral, project_id: project.id) }
  let(:skill4) { create(:skill, skill_type: :technical, project_id: project.id) }

  let(:params) do
    {
      data: {
        type: 'development_actions',
        attributes: {
          name: 'Test Action',
          description: 'Test Description'
        },
        relationships: {
          skills: {
            data: [
              { type: 'skills', id: skill1.id.to_s },
              { type: 'skills', id: skill2.id.to_s }
            ]
          },
          project: {
            data: { type: 'projects', id: project.id.to_s }
          }
        }
      }
    }
  end

  let(:contract) do
    Api::V2::DevelopmentAction::Contract.new(
      schema: Api::V2::DevelopmentAction::Schema.create_request
    )
  end

  describe 'validations' do
    it 'validates presence of skills' do
      params[:data][:relationships][:skills][:data] = []
      result = contract.call(params)
      expect(result.failure?).to eq(true)
      expect(
        result.errors.to_hash.dig(:data, :relationships, :skills)
      ).to include('Please select at least one skill.')
    end

    it 'validates skills belong to the project' do
      params[:data][:relationships][:skills][:data] = [
        { type: 'skills', id: skill2.id.to_s },
        { type: 'skills', id: skill4.id.to_s }
      ]
      result = contract.call(params)
      expect(
        result.errors.to_hash.dig(:data, :relationships, :skills)
      ).to include('The selected skills must belong to the specified project.')
    end

    it 'allows only global skills if no project is specified' do
      params[:data][:relationships][:project] = nil
      result = contract.call(params)
      expect(
        result.errors.to_hash.dig(:data, :relationships, :skills)
      ).to be_nil
    end

    it 'validates only global skills if no project is specified' do
      params[:data][:relationships][:project] = nil
      params[:data][:relationships][:skills][:data] = [
        { type: 'skills', id: skill3.id.to_s },
        { type: 'skills', id: skill4.id.to_s }
      ]
      result = contract.call(params)
      expect(
        result.errors.to_hash.dig(:data, :relationships, :skills)
      ).to include('The selected skills must be global skills.')
    end
  end
end

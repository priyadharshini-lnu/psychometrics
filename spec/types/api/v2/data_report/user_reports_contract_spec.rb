# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::DataReport::UserReportsContract do
  let(:tenancy) { create(:tenancy) }
  let(:project) { create(:project, parent: tenancy) }
  let(:other_tenancy) { create(:tenancy) }
  let(:other_project) { create(:project, parent: other_tenancy) }

  let(:contract) { described_class.new(schema: Api::V2::DataReport::Schema.create_request) }

  def params_for(attributes = {}, relationships = {})
    {
      data: {
        type: 'data_reports',
        attributes: attributes,
        relationships: relationships
      }
    }
  end

  def valid_params(scope: 'client', project_ids: [project.id], client_id: tenancy.id.to_s)
    relationships = scope == 'client' ? { owner: { data: { id: client_id, type: 'clients' } } } : {}
    params_for(
      {
        name: 'Test Report',
        scope: scope,
        report_type: 'user_reports_export',
        configuration: Oj.dump({ 'project_ids' => project_ids }, mode: :compat)
      },
      relationships
    )
  end

  describe 'report_type validation' do
    it 'succeeds with valid report_type' do
      result = contract.call(valid_params)

      expect(result.success?).to be true
    end

    it 'fails when report_type is not user_reports' do
      params = valid_params
      params[:data][:attributes][:report_type] = 'invalid_type'

      result = contract.call(params)

      expect(result.failure?).to be true
    end
  end

  describe 'configuration validation' do
    it 'fails when configuration is invalid JSON' do
      params = valid_params
      params[:data][:attributes][:configuration] = 'invalid json'

      result = contract.call(params)

      expect(result.failure?).to be true
      error_message = result.errors.to_hash.values.flatten.join(' ')
      expect(error_message).to include(I18n.t('admin.invalid_json'))
    end

    it 'fails when project_ids is missing' do
      params = valid_params
      params[:data][:attributes][:configuration] = Oj.dump({})

      result = contract.call(params)

      expect(result.failure?).to be true
      error_message = result.errors.to_hash.values.flatten.join(' ')
      expect(error_message).to include(I18n.t('admin.project_ids_required'))
    end

    it 'fails when project_ids is empty' do
      params = valid_params(project_ids: [])

      result = contract.call(params)

      expect(result.failure?).to be true
      error_message = result.errors.to_hash.values.flatten.join(' ')
      expect(error_message).to include(I18n.t('admin.project_ids_required'))
    end

    it 'fails when project_ids contains non-existent projects' do
      params = valid_params(project_ids: [999_999])

      result = contract.call(params)

      expect(result.failure?).to be true
      error_message = result.errors.to_hash.values.flatten.join(' ')
      expect(error_message).to include(I18n.t('admin.invalid_project_ids',
                                              ids: '999999'))
    end
  end

  describe 'client scope validation' do
    it 'succeeds when project belongs to the client' do
      result = contract.call(valid_params)

      expect(result.success?).to be true
    end

    it 'fails when project does not belong to the client' do
      params = valid_params(project_ids: [other_project.id])

      result = contract.call(params)

      expect(result.failure?).to be true
      error_message = result.errors.to_hash.values.flatten.join(' ')
      expect(error_message).to include(
        I18n.t('admin.project_not_related_to_client', project_id: other_project.id)
      )
    end
  end

  describe 'global scope validation' do
    it 'succeeds with any valid project_ids' do
      params = valid_params(scope: 'global', project_ids: [project.id, other_project.id])

      result = contract.call(params)

      expect(result.success?).to be true
    end

    it 'fails with non-existent project_ids' do
      params = valid_params(scope: 'global', project_ids: [999_999])

      result = contract.call(params)

      expect(result.failure?).to be true
      error_message = result.errors.to_hash.values.flatten.join(' ')
      expect(error_message).to include(I18n.t('admin.invalid_project_ids',
                                              ids: '999999'))
    end
  end
end

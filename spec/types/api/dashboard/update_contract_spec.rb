# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Dashboard::UpdateContract do
  let(:powerbi_dashboard) { double(powerbi?: true, oracle_analytics?: false) }
  let(:oracle_analytics_dashboard) { double(powerbi?: false, oracle_analytics?: true) }

  let(:valid_params) do
    jsonapi_resource_request(
      'dashboards',
      { id: '1', dashboard_type: 'powerbi', name: 'New Dashboard', enabled: true, dataset_id: 'd_100',
        report_id: 'r_100' },
      { campaign: { id: '2', type: 'campaigns' } }
    )
  end

  context 'powerbi dashboard' do
    it 'dataset_id and report_id should be present if dashboard is enabled' do
      params = jsonapi_merge_attributes(valid_params, { enabled: true, dataset_id: '', report_id: '' })
      schema = Api::V2::Dashboard::UpdateContract.new.call(params, { dashboard: powerbi_dashboard })

      expect(schema.failure?).to eq(true)
      expect(schema).to have_jsonapi_attr_error({ dataset_id: ["can't be blank"], report_id: ["can't be blank"] })
    end

    it 'dataset_id and report_id can be blank if dashboard is not enabled' do
      params = jsonapi_merge_attributes(valid_params, { enabled: false, dataset_id: '', report_id: '' })
      schema = Api::V2::Dashboard::UpdateContract.new.call(params, { dashboard: powerbi_dashboard })

      expect(schema.failure?).to eq(false)
    end
  end

  context 'oracle analytics dashboard' do
    it 'project_path hould be present if dashboard is enabled' do
      params = jsonapi_merge_attributes(valid_params, { enabled: true, project_path: '' })
      schema = Api::V2::Dashboard::UpdateContract.new.call(params, { dashboard: oracle_analytics_dashboard })

      expect(schema.failure?).to eq(true)
      expect(schema).to have_jsonapi_attr_error({ project_path: ["can't be blank"] })
    end

    it 'project_path and report_id can be blank if dashboard is not enabled' do
      params = jsonapi_merge_attributes(valid_params, { enabled: false, project_path: '' })
      schema = Api::V2::Dashboard::UpdateContract.new.call(params, { dashboard: oracle_analytics_dashboard })

      expect(schema.failure?).to eq(false)
    end
  end
end

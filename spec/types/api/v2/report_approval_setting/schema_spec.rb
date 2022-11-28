# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::ReportApprovalSetting::Schema do
  let(:valid_params) do
    jsonapi_resource_request(
      'report_approval_setting',
      { id: '100', qc_user_ids: [1] },
      { report: { id: '1', type: 'reports' } }
    )
  end

  describe 'create_request' do
    let(:create_schema) { Api::V2::ReportApprovalSetting::Schema.create_request }
    let(:update_schema) { Api::V2::ReportApprovalSetting::Schema.update_request }

    it 'validates presence of report' do
      schema = create_schema.call(
        jsonapi_remove_relationships(valid_params, :report)
      )

      expect(schema).to have_jsonapi_relationship_error(
        report: ["can't be blank"]
      )
    end
  end
end

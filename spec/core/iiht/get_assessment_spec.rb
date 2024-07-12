# frozen_string_literal: true

require 'rails_helper'

describe Iiht::GetAssessments do
  let(:project) { create(:project) }
  let(:config) { { 'tenant_id' => '123' } }
  let(:assessment_response) { { 'assessmentIdNumber' => 1, 'name' => 'testName', 'description' => 'description1' } }

  before do
    allow(project).to receive(:iiht_config).and_return(config)
    allow(Iiht::GetAuthToken).to receive(:call!)
  end

  it 'gets Iiht assessments details' do
    expected_response = [assessment_response]
    stub_request(:get, "#{Settings.iiht.base_api_url}/GetAssessments").
      with(query: {
        tenantId: config['tenant_id'], maxResultCount: 100, skipCount: 0
      }).
      to_return({ body: { 'result' => { 'assessments' => expected_response, totalCount: 1 } }.to_json })
    response = described_class.call!(project)

    expect(response).to eq(expected_response)
  end

  it 'calls api multiple times if total assessment is more than 100' do
    stub_request(:get, "#{Settings.iiht.base_api_url}/GetAssessments").
      with(query: {
        tenantId: config['tenant_id'], maxResultCount: 100, skipCount: 0
      }).
      to_return({ body: { 'result' => { 'assessments' => [assessment_response] * 100, totalCount: 102 } }.to_json })
    stub_request(:get, "#{Settings.iiht.base_api_url}/GetAssessments").
      with(query: {
        tenantId: config['tenant_id'], maxResultCount: 100, skipCount: 100
      }).
      to_return({ body: { 'result' => { 'assessments' => [assessment_response] * 2, totalCount: 102 } }.to_json })
    response = described_class.call!(project)

    expect(response).to eq([assessment_response] * 102)
  end

  it 'stops calling api multiple times if there are no assessments received' do
    stub_request(:get, "#{Settings.iiht.base_api_url}/GetAssessments").
      with(query: {
        tenantId: config['tenant_id'], maxResultCount: 100, skipCount: 0
      }).
      to_return({ body: { 'result' => { 'assessments' => [], totalCount: 102 } }.to_json })
    response = described_class.call!(project)

    expect(response).to eq([])
  end

  context 'when an error occurs in iiht api' do
    it 'rescues from StandardError and returns nil' do
      stub_request(:get, "#{Settings.iiht.base_api_url}/GetAssessments").
        with(query: {
          tenantId: config['tenant_id'], maxResultCount: 100, skipCount: 0
        }).
        and_raise(Faraday::Error)

      response = described_class.call!(project)

      expect(response).to eq([])
    end
  end
end

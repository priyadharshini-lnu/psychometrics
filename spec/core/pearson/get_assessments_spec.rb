# frozen_string_literal: true

require 'rails_helper'

describe Pearson::GetAssessments do
  it 'gets pearson assessments details' do
    config = Settings.secrets.pearson
    allow(Pearson::GetAuthToken).to receive(:call!)
    stub_request(:get, "#{config[:base_api_url]}/v1/products?pageSize=100000").
      to_return({ body: { 'data' => [{ 'productId' => 123 }] }.to_json })
    response = described_class.call!

    expect(response).to eq([{ 'productId' => 123 }])
  end
end

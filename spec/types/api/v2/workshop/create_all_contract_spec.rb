# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Workshop::CreateAllContract, type: :contract do
  let(:valid_url) { 'http://example.com' }
  let(:invalid_url) { 'invalid_url' }
  let(:valid_workshop) do
    {
      name: 'name',
      timezone: 'Pacific/Midway',
      duration: 3600,
      cancellation_lead_time: 3600,
      scheduling_lead_time: 3600,
      video_call_type: 0,
      start_time: 'Wed Jul 05 2023 00:07:43 GMT+0530',
      allow_late_cancellation_and_rescheduling: true,
      workshop_resources: [
        { name: 'Resource 1', url: valid_url },
        { name: 'Resource 2', url: valid_url }
      ]
    }
  end
  let(:invalid_workshop) do
    {
      name: 'name',
      timezone: 'Pacific/Midway',
      duration: 3600,
      cancellation_lead_time: 3600,
      scheduling_lead_time: 3600,
      video_call_type: 0,
      start_time: 'Wed Jul 05 2023 00:07:43 GMT+0530',
      allow_late_cancellation_and_rescheduling: true,
      workshop_resources: [
        { name: 'resource', url: valid_url },
        { name: 'Resource 2', url: invalid_url }
      ]
    }
  end

  let(:params) do
    {
      data: {
        attributes: {
          workshops: [valid_workshop, invalid_workshop]
        }
      }
    }
  end

  context 'workshop resources name validation' do
    it 'validates the presence of resource name' do
      params[:data][:attributes][:workshops][0][:workshop_resources][0][:name] = ''
      response = described_class.new.call(params)

      expect(
        response.errors.to_hash.dig(:data, :attributes, :workshops, 0, :workshop_resources, 0, :name)
      ).to include('can\'t be blank')
    end

    it 'does not add errors for valid resource names' do
      response = described_class.new.call(params)

      expect(response.errors.to_hash.dig(:data, :attributes, :workshops, 0, :workshop_resources, 0, :name)).to be_nil
    end
  end

  context 'workshop resources url validation' do
    subject { described_class.new.call(params) }

    it 'validates the format of resource URLs' do
      expect(
        subject.errors.to_hash.dig(:data, :attributes, :workshops, 1, :workshop_resources, 1, :url)
      ).to include(I18n.t('activerecord.errors.messages.invalid_http_url'))
    end

    it 'does not add errors for valid resource URLs' do
      expect(subject.errors.to_hash.dig(:data, :attributes, :workshops, 0, :workshop_resources, 0, :url)).to be_nil
    end

    it 'does not add errors for valid workshops' do
      expect(subject.errors.to_hash.dig(:data, :attributes, :workshops, 0)).to be_nil
    end
  end
end

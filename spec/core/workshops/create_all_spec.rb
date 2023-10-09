# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Workshops::CreateAll do
  let(:campaign) { create(:campaign) }
  let(:admin) { create(:client_admin) }
  let(:workshops) do
    [
      {
        timezone: 'Pacific/Midway',
        duration: 3600,
        cancellation_lead_time: 3600,
        reschedule_lead_time: 3600,
        video_call_type: 0,
        workshop_resources: [
          {
            name: 'name',
            url: 'www.abc.com'
          }
        ],
        start_time: 'Wed Jul 05 2023 00:07:43 GMT+0530',
        assessor_ids: [
          admin.id
        ],
        center_manager_ids: [
          admin.id
        ]
      }
    ]
  end

  let(:invalid_data) do
    [
      {
        timezone: 'Pacific/Midway',
        duration: '',
        cancellation_lead_time: 3600,
        reschedule_lead_time: 3600,
        video_call_type: 0,
        workshop_resources: [
          {
            name: 'name',
            url: 'www.abc.com'
          }
        ],
        start_time: 'Wed Jul 05 2023 00:07:43 GMT+0530'
      }
    ]
  end

  subject { described_class.new(workshops, campaign.id) }

  describe '#call' do
    context 'with valid data' do
      it 'creates workshops with their resources and broadcasts ok with new workshop IDs' do
        expect { subject.call }.to change { Workshop.count }.by(
          workshops.size
        )
      end

      it 'creates workshops_resources' do
        expect { subject.call }.to change { WorkshopResource.count }.by(
          workshops.sum { |workshop| workshop[:workshop_resources].size }
        )
      end

      it 'create workshop_assessors' do
        expect { subject.call }.to change { WorkshopAssessor.count }.by(
          workshops.sum { |workshop| workshop[:assessor_ids].size }
        )
      end

      it 'create workshop_managers' do
        expect { subject.call }.to change { WorkshopManager.count }.by(
          workshops.sum { |workshop| workshop[:center_manager_ids].size }
        )
      end

      it 'create workshops and return it as array' do
        response = described_class.call!(workshops, campaign.id)
        expect(response[:workshops]).to include(Workshop.last)
      end
    end

    context 'with invalid data' do
      it 'raises ActiveRecord::RecordInvalid and handles rollback' do
        invalid_subject = described_class.new(invalid_data, campaign.id)
        expect { invalid_subject.call }.to broadcast(
          :error, { title: 0, detail: I18n.t('administration.errors.error_msg') }
        )
      end
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::MigrateCommunicationCenter do
  let(:owner)  { create(:superadmin) }
  let(:client) { create(:tenancy) }

  def job_record_for(client_id)
    create(:admin_job_record,
           operation: :migrate_communication_center,
           owner:     owner,
           data:      { 'client_id' => client_id })
  end

  before do
    # Prevent real email dispatch from deliveries created inside the migrator
    allow(Communications::Deliveries::Trigger).to receive(:call)
  end

  describe '#valid?' do
    it 'returns true when the client exists' do
      record = job_record_for(client.id)
      expect(described_class.new(record).valid?).to eq(true)
    end

    it 'returns false when no client matches the stored id' do
      record = job_record_for(-1)
      expect(described_class.new(record).valid?).to eq(false)
    end
  end

  describe '#call when the client does not exist' do
    it 'broadcasts :error with the client-not-found message' do
      record = job_record_for(-1)

      expect { described_class.new(record).call }.
        to broadcast(:error, I18n.t('admin_jobs.client_not_found', id: -1))
    end

    it 'does not run the migration service' do
      record = job_record_for(-1)
      allow(CommunicationCenter::Migrate).to receive(:new).and_call_original

      described_class.new(record).call

      expect(CommunicationCenter::Migrate).not_to have_received(:new)
    end
  end

  describe '#call when migration succeeds without errors' do
    it 'broadcasts :ok with no payload' do
      allow(CommunicationCenter::Migrate).
        to receive(:new).and_return(double(call: { errors: [], migrated: 1 }))
      record = job_record_for(client.id)

      expect { described_class.new(record).call }.to broadcast(:ok)
    end
  end

  describe '#call when migration returns errors' do
    it 'broadcasts :ok with error_messages payload' do
      messages = ['Communication id=42: something went wrong']
      allow(CommunicationCenter::Migrate).
        to receive(:new).and_return(double(call: { errors: messages, migrated: 0 }))
      record = job_record_for(client.id)

      expect { described_class.new(record).call }.
        to broadcast(:ok, { error_messages: messages })
    end
  end

  describe '#generate_title_link' do
    it 'returns the client name as the label when the client exists' do
      record = job_record_for(client.id)

      link = described_class.new(record).generate_title_link

      expect(link[:label]).to eq(client.name)
    end

    it 'falls back to the raw client_id string when the client does not exist' do
      record = job_record_for(-1)

      link = described_class.new(record).generate_title_link

      expect(link[:label]).to eq(-1)
    end

    it 'always returns a nil href' do
      record = job_record_for(client.id)

      link = described_class.new(record).generate_title_link

      expect(link[:href]).to be_nil
    end
  end
end

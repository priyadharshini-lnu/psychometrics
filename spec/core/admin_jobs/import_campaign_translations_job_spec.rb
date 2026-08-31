# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::ImportCampaignTranslationsJob do
  let(:record) { create(:admin_job_record, operation: :import_campaign_translations, data: { project_id: 123 }) }

  describe '#call' do
    it 'broadcasts ok when import succeeds' do
      service = instance_double(Administration::ImportCampaignTranslations, call: true)
      allow(Administration::ImportCampaignTranslations).to receive(:new).and_return(service)

      expect { described_class.new(record).call }.to broadcast(:ok)
    end

    it 'raises error when import returns failure payload' do
      service = instance_double(Administration::ImportCampaignTranslations, call: ['Error message'])
      allow(Administration::ImportCampaignTranslations).to receive(:new).and_return(service)

      expect { described_class.new(record).call }.
        to raise_error(StandardError, 'Import failed: Error message')
    end
  end
end

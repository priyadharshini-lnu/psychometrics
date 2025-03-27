# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::ImportDevelopmentActionTranslationsJob do
  let(:record) { create(:admin_job_record, operation: :import_development_action_translations) }

  describe '#call' do
    it 'imports translations successfully' do
      import_service = instance_double(Administration::ImportDevelopmentActionTranslations)
      allow(Administration::ImportDevelopmentActionTranslations).to receive(:new).and_return(import_service)
      allow(import_service).to receive(:call).and_return(true)

      expect { described_class.new(record).call }.to broadcast(:ok)
    end

    it 'raises error when import fails' do
      import_service = instance_double(Administration::ImportDevelopmentActionTranslations)
      allow(Administration::ImportDevelopmentActionTranslations).to receive(:new).and_return(import_service)
      allow(import_service).to receive(:call).and_return(['Error message'])

      expect { described_class.new(record).call }.
        to raise_error(StandardError, 'Import failed: Error message')
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::ImportCampaignAIArtifactsJob do
  let(:campaign) { create(:campaign) }
  let(:owner) { create(:superadmin) }
  let(:job_record) do
    create(:admin_job_record,
           owner: owner,
           operation: :import_campaign_ai_artifacts,
           data: { 'campaign_id' => campaign.id })
  end
  let(:file_blob) do
    ActiveStorage::Blob.create_and_upload!(
      io: StringIO.new('code,name'),
      filename: 'artifacts.csv',
      content_type: 'text/csv'
    )
  end

  before do
    job_record.file.attach(file_blob)
  end

  describe '#call' do
    it 'runs the importer and broadcasts success' do
      importer = instance_double(Administration::ImportCampaignAIArtifacts)

      expect(Administration::ImportCampaignAIArtifacts).to receive(:new).with(
        job_record.file,
        campaign.id
      ).and_return(importer)

      expect(importer).to receive(:call)

      job = described_class.new(job_record)
      expect(job).to receive(:broadcast).with(:ok)

      job.call
    end
  end
end

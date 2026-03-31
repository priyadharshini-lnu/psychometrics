# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CleanupStaleTemporaryUploadsJob, type: :job do
  describe '#perform' do
    let!(:stale_upload) { create(:temporary_upload, status: :pending, created_at: 25.hours.ago) }
    let!(:recent_upload) { create(:temporary_upload, status: :pending, created_at: 1.hour.ago) }
    let!(:processed_upload) { create(:temporary_upload, status: :processed, created_at: 25.hours.ago) }

    before do
      @s3_client_mock = instance_double(Aws::S3::Client)
      allow(Aws::S3::Client).to receive(:new).and_return(@s3_client_mock)
      allow(@s3_client_mock).to receive(:delete_object).and_return(true)
    end

    it 'deletes stale pending uploads and their S3 objects' do
      expect do
        described_class.new.perform
      end.to change(TemporaryUpload, :count).by(-1)

      expect(TemporaryUpload.exists?(stale_upload.id)).to be_falsey
      expect(TemporaryUpload.exists?(recent_upload.id)).to be_truthy
      expect(TemporaryUpload.exists?(processed_upload.id)).to be_truthy

      expect(@s3_client_mock).to have_received(:delete_object).with(
        bucket: stale_upload.bucket,
        key: stale_upload.file_key
      )
    end

    it 'destroys record even if S3 delete fails' do
      allow(@s3_client_mock).to receive(:delete_object).and_raise(Aws::S3::Errors::NoSuchKey.new(nil, 'Not Found'))

      expect do
        described_class.new.perform
      end.to change(TemporaryUpload, :count).by(-1)

      expect(TemporaryUpload.exists?(stale_upload.id)).to be_falsey
    end
  end
end

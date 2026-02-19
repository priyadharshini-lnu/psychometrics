# frozen_string_literal: true

require 'rails_helper'

describe ObjectStorage::GetSingleSignedUploadUrl do
  let(:user_assessment) { create(:user_assessment) }
  let(:media) { create(:user_assessment_verification_medium, user_assessment: user_assessment) }
  let(:field) { :file }
  let(:blob_params) do
    { 'filename' => 'file.txt', 'byte_size' => 100, 'checksum' => 'checksum', 'content_type' => 'text/plain' }
  end
  let(:blob) { double(:blob, as_json: { signed_id: 'signed_id' }, service_url_for_direct_upload: 'url') }

  before do
    allow(ActiveStorage::Blob).to receive(:create_before_direct_upload!).and_return(blob)
    allow(blob).to receive(:as_json).and_return(blob.as_json)
    allow(blob).to receive(:service_url_for_direct_upload).and_return('url')
    allow(blob).to receive(:service_headers_for_direct_upload).and_return('headers')
  end

  subject { described_class.new(model: media, field: field, blob_params: blob_params, file_name: 'file.txt') }

  describe '#call' do
    it 'creates a blob' do
      expect(ActiveStorage::Blob).to receive(:create_before_direct_upload!).with(
        key: media.attachment_storage_path(field, 'file.txt'),
        filename: 'file.txt',
        byte_size: 100,
        checksum: 'checksum',
        content_type: 'text/plain',
        service_name: Settings.storage.private_storage_service
      )

      subject.call
    end

    it 'sets asset_key to the attachment_storage_path' do
      expect(media).to receive(:attachment_storage_path).with(field, 'file.txt').and_return(
        'private/projects/1/user_verification_media/1/file/file.txt'
      )

      subject.call
    end

    it 'broadcasts ok with direct upload json' do
      expect(subject).to receive(:broadcast).with(:ok, {
        signed_id: 'signed_id',
        url: 'url',
        media_id: media.id,
        direct_upload: { url: 'url', headers: 'headers' }
      })

      subject.call
    end
  end
end

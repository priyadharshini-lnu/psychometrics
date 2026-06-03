# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SystemCheckRecords::ProcessMediaUpload, type: :command do
  let(:user) { create(:user, :with_project_membership) }
  let(:campaign) { user.project.campaigns.first || create(:campaign, project: user.project) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:system_check_session) { create(:system_check_session, user: user) }
  let(:system_check_record) do
    create(:system_check_record, :video, system_check_session: system_check_session, passed: false)
  end

  let(:blob) do
    ActiveStorage::Blob.create_and_upload!(io: StringIO.new('test'), filename: 'test.webm', content_type: 'video/webm')
  end

  before do
    mock_client = double('s3_client')
    allow(Aws::S3::Client).to receive(:new).and_return(mock_client)
    allow(mock_client).to receive(:complete_multipart_upload).and_return(true)

    allow(ActiveStorage::Blob).to receive(:create_before_direct_upload!).and_return(blob)
  end

  it 'completes multipart upload, attaches blob and marks record passed' do
    parts = [ActionController::Parameters.new({ 'part_number' => 1, 'etag' => 'etag1' })]

    result = described_class.call(system_check_record, asset_key: 'some/key/video.webm', upload_id: 'upload_1',
  parts: parts, file_size: 4, content_type: 'video/webm', checksum: 'abc123')

    expect(result[:ok]).to be_present
    updated = result[:ok]
    expect(updated).to be_persisted
    expect(updated.passed).to be true
    expect(updated.reload.media).to be_attached
  end
end

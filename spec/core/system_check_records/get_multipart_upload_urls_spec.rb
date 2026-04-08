# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SystemCheckRecords::GetMultipartUploadUrls, type: :command do
  let(:user) { create(:user, :with_project_membership) }
  let(:campaign) { user.project.campaigns.first || create(:campaign, project: user.project) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:system_check_session) { create(:system_check_session, user: user) }
  let(:system_check_record) { create(:system_check_record, :video, system_check_session: system_check_session) }

  it 'returns upload_id, asset_key and urls' do
    mock_client = double('s3_client')
    allow(Aws::S3::Client).to receive(:new).and_return(mock_client)
    allow(mock_client).to receive(:create_multipart_upload).and_return(
      double('multipart_upload', upload_id: 'upload_123')
    )

    mock_presigner = instance_double(Aws::S3::Presigner)
    allow(Aws::S3::Presigner).to receive(:new).and_return(mock_presigner)
    allow(mock_presigner).to receive(:presigned_url).and_return('https://example.com/part')

    result = described_class.call(system_check_record, 'video_file.webm')

    expect(result[:ok]).to be_present
    payload = result[:ok]
    expect(payload[:upload_id]).to eq('upload_123')
    expect(payload[:asset_key]).to be_present
    expect(payload[:urls]).to be_an(Array)
  end
end

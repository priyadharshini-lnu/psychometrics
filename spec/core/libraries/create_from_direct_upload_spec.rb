# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Libraries::CreateFromDirectUpload do
  let(:project) { create(:project) }
  let(:user) { create(:project_admin, project: project) }
  let(:temporary_upload) { create(:temporary_upload, user: user) }
  let(:params) do
    {
      temporary_upload_id: temporary_upload.id,
      name: 'Test Library',
      description: 'A test description',
      type: 'other',
      owner_id: project.id
    }
  end

  subject { described_class.call(params, user) }

  before do
    allow(Settings.secrets.s3_compatible_storage).to receive(:[]).with(:public_bucket).and_return('test-bucket')

    # Mock AWS S3 client
    @s3_client_mock = instance_double(Aws::S3::Client)
    allow(Aws::S3::Client).to receive(:new).and_return(@s3_client_mock)
    allow(@s3_client_mock).to receive(:copy_object).and_return(true)
    allow(@s3_client_mock).to receive(:delete_object).and_return(true)
  end

  it 'creates a library and attaches the file' do
    expect { subject }.to change(Library, :count).by(1)

    library = Library.last
    expect(library.name).to eq('Test Library')
    expect(library.file.attached?).to be_truthy

    expect(@s3_client_mock).to have_received(:copy_object)
    expect(@s3_client_mock).to have_received(:delete_object).with(
      bucket: temporary_upload.bucket,
      key: temporary_upload.file_key
    )

    temporary_upload.reload
    expect(temporary_upload.status).to eq('processed')
    expect(subject[:ok]).to eq(library)
  end

  context 'when upload id is not found' do
    let(:params) { { temporary_upload_id: 0, name: 'Test' } }

    it 'returns error' do
      expect { subject }.not_to change(Library, :count)
      expect(subject[:error]).to be_present
    end
  end
end

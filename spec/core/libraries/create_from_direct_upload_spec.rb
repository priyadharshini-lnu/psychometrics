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
    expect(library.tenant_id).to eq(library.owner_id)
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

  context 'when temporary upload key has spaces' do
    let(:temporary_upload) do
      create(
        :temporary_upload,
        user: user,
        filename: 'Screenshot 2026-04-06 at 3.24.12 PM.png',
        file_key: "#{Settings.aws.s3.temporary_upload_folder}/abc123/Screenshot 2026-04-06 at 3.24.12 PM.png"
      )
    end

    it 'copies object using an encoded copy_source path' do
      subject

      expect(@s3_client_mock).to have_received(:copy_object).with(
        hash_including(
          copy_source:
            'public-bucket/private%2Ftmp%2Fuploads%2Fabc123%2FScreenshot%202026-04-06%20at%203.24.12%20PM.png'
        )
      )
    end
  end

  context 'when upload id is not found' do
    let(:params) { { temporary_upload_id: 0, name: 'Test' } }

    it 'returns error' do
      expect { subject }.not_to change(Library, :count)
      expect(subject[:error]).to be_present
    end
  end

  context 'when user is a client admin and owner_id is blank' do
    let(:client) { create(:tenancy) }
    let(:other_client) { create(:tenancy) }
    let(:user) { create(:client_admin, client: other_client) }
    let(:temporary_upload) { create(:temporary_upload, user: user) }
    let(:params) do
      {
        temporary_upload_id: temporary_upload.id,
        name: 'Client Admin Library',
        description: 'A test description',
        type: 'other',
        owner_id: nil
      }
    end

    before do
      create(:client_admin_membership, user: user, client: client)
      Current.client = client
    end

    after do
      Current.client = nil
    end

    it 'assigns owner_id from Current.client' do
      subject

      expect(subject[:error]).to be_nil
      expect(subject[:ok].owner_id).to eq(client.id)
      expect(subject[:ok].tenant_id).to eq(subject[:ok].owner_id)
    end
  end
end

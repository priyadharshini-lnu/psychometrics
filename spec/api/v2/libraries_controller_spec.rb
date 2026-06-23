# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::LibrariesController, type: :request do
  let(:superadmin) { create(:superadmin) }
  let!(:include_resource_meta) { 'permissions' }
  let!(:library) { create(:library) }

  before(:each) do
    sign_in(superadmin)
  end

  describe 'GET /api/v2/libraries' do
    it 'returns libraries list' do
      get '/api/v2/administration/libraries',
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      libraries = JSON.parse(response.body)
      library_response = libraries['data'].find { |l| l['id'] == library.id.to_s }
      expect(library_response).to have_key('id')
      expect(library_response).to have_attribute(:name).with_value(library.name)
      expect(library_response).to have_attribute(:type).with_value(library.type)
      expect(library_response).to have_attribute(:created_at).with_value(library.decorate.created_at)
      expect(library_response).to have_attribute(:file_url).with_value(library.decorate.file_url)
      expect(library_response).to have_attribute(:file_is_image).with_value(library.file&.image?)
      expect(library_response).to have_attribute(:file_icon_url).with_value(library.file_url(:icon))
    end
  end

  describe 'POST /api/v2/libraries' do
    before do
      allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)
      allow_any_instance_of(Library).to receive(:file_url).and_return('http://example.com/test.pdf')
    end

    let(:file_path) { Rails.root.join('spec/fixtures/files/reports/test.pdf') }
    let(:project) { create(:project) }

    it 'creates a new library' do
      file = Rack::Test::UploadedFile.new(file_path, 'application/pdf')
      body = {
        data: {
          type: 'libraries',
          attributes: {
            name: 'Library Name',
            type: 'other',
            description: 'Library Description',
            owner_id: project.id
          }
        }
      }

      post '/api/v2/administration/libraries',
           params: body.merge({ files: [file] }),
           headers: {
             'Content-Type' => 'application/vnd.api+json',
             'Accept' => 'application/vnd.api+json'
           }

      expect(response).to have_http_status(:created)
      library_response = JSON.parse(response.body)['data'][0]
      expect(library_response).to have_key('id')
      expect(library_response).to have_attribute(:name).with_value('Library Name')
      expect(library_response).to have_attribute(:type).with_value('other')
      expect(library_response).to have_relationship(:owner).with_data(
        { 'id' => project.id.to_s, 'type' => 'clients' }
      )
    end
  end

  describe 'POST /api/v2/administration/libraries/create_from_upload' do
    let(:project) { create(:project) }
    let(:temporary_upload) { create(:temporary_upload, user: superadmin) }
    let(:created_library) { build_stubbed(:library, name: 'Direct Library', type: 'other') }

    before do
      allow(Libraries::CreateFromDirectUpload).to receive(:call).and_return({ ok: created_library })
    end

    it 'creates a new library from direct upload' do
      body = {
        temporary_upload_ids: [temporary_upload.id],
        name: 'Direct Library',
        type: 'other',
        owner_id: project.id
      }

      post '/api/v2/administration/libraries/create_from_upload',
           params: body,
           as: :json

      expect(response).to have_http_status(:created)
    end
  end

  describe 'PUT /api/v2/libraries/:id' do
    before do
      allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)
      allow_any_instance_of(Library).to receive(:file_url).and_return('http://example.com/test.pdf')
    end

    let(:file_path) { Rails.root.join('spec/fixtures/files/reports/test.pdf') }
    let(:project) { create(:project) }

    it 'updates an existing library' do
      file = Rack::Test::UploadedFile.new(file_path, 'application/pdf')
      put "/api/v2/administration/libraries/#{library.id}",
          params: {
            data: {
              id: library.id,
              type: 'libraries',
              attributes: {
                name: 'Updated Library Name',
                type: 'other',
                description: 'Updated Library Description',
                owner_id: project.id
              }
            },
            file: file
          },
          headers: {
            'Content-Type' => 'application/vnd.api+json',
            'Accept' => 'application/vnd.api+json'
          }

      expect(response).to have_http_status(:ok)
      library_response = JSON.parse(response.body)['data']
      expect(library_response).to have_key('id')
      expect(library_response).to have_attribute(:name).with_value('Updated Library Name')
      expect(library_response).to have_attribute(:type).with_value('other')
      expect(library_response).to have_relationship(:owner).with_data(
        { 'id' => project.id.to_s, 'type' => 'clients' }
      )
    end
  end

  describe 'DELETE /api/v2/libraries/:id' do
    it 'deletes an existing library' do
      delete "/api/v2/administration/libraries/#{library.id}",
             headers: {
               'Content-Type' => 'application/vnd.api+json',
               'Accept' => 'application/vnd.api+json'
             }

      expect(response).to have_http_status(:no_content)
      expect(Library.where(id: library.id)).to be_empty
    end

    context 'deletes nested library' do
      let!(:parent_library) { create(:library, type: 'folder') }
      let!(:child_library) { create(:library, parent: parent_library) }

      it 'deletes an existing nested library' do
        delete "/api/v2/administration/libraries/#{child_library.id}",
               headers: {
                 'Content-Type' => 'application/vnd.api+json',
                 'Accept' => 'application/vnd.api+json'
               }

        expect(response).to have_http_status(:no_content)
        expect(Library.where(id: child_library.id)).to be_empty
      end
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PortableData::Imports::Base do
  before do
    secrets = instance_double(
      'Settings::Secrets',
      import_export_secret: 'abc',
      encrypted_key: Base64.strict_encode64('a' * 32)
    )

    allow(Settings).to receive(:secrets).and_return(secrets)
  end

  let(:hmac_signature) do
    OpenSSL::HMAC.hexdigest('SHA256', Settings.secrets.import_export_secret, json_file_content.to_json)
  end

  let(:json_file_content_with_hmac) do
    json_file_content[:meta][:hmac_signature] = hmac_signature
    json_file_content
  end

  let(:project_manager) { create(:superadmin) }
  let(:client) do
    create(:client,
           number: '123',
           country: 'UAE',
           year: '2024',
           project_manager: project_manager)
  end
  let(:map_client) do
    create(:client,
           number: '1234',
           country: 'India',
           year: '2024',
           project_manager: project_manager)
  end

  let(:json_file_content) do
    {
      meta: {
        resource_import_order: %i[dimensions factors]
      },
      resources: {
        dimensions: {
          model: 'Dimension',
          schema: [
            { name: :id, type: ['primitive'] },
            { name: :name, type: ['primitive'] },
            { name: :disabled, type: ['primitive'] },
            { name: :created_by_id, type: ['primitive'] },
            { name: :updated_by_id, type: ['primitive'] },
            { name: :owner_id, type: ['mappable'], model: Client }
          ],
          data: {
            id: 585,
            name: 'test_dimension',
            disabled: false,
            created_by_id: project_manager.id,
            updated_by_id: project_manager.id,
            owner_id: client.id.to_s
          }
        },
        factors: {
          model: 'Factor',
          schema: [
            { name: :id, type: ['primitive'] },
            { name: :name, type: ['primitive'] },
            { name: :dimension_id, type: ['relationship'] },
            { name: :icon, type: ['attachment'] }
          ],
          data: [{
            id: 11_696,
            name: 'test_factor',
            dimension_id: 585,
            icon: {
              blob_id: 12_000_004_878,
              url: 'http://example.com/test.png',
              filename: 'test.png'
            }
          }]
        }
      }
    }
  end

  let(:mock_response) do
    instance_double(
      Net::HTTPSuccess,
      body: 'fake_binary_data',
      content_type: 'image/png',
      error!: nil,
      code: '200'
    )
  end

  before do
    # Stub the HTTP request for the icon
    stub_request(:get, 'http://example.com/test.png').
      to_return(
        status: 200,
        body: 'fake_binary_data',
        headers: { 'Content-Type' => 'image/png' }
      )
  end

  describe '#import!' do
    context 'hmac verify' do
      before do
        json_file_content[:meta].merge!(hmac_signature: 'invalid')
      end
      it 'verifies HMAC signature before import' do
        import = described_class.new(
          json_file_content: json_file_content.to_json
        )

        expect(import.import!).to eq(['Invalid HMAC signature'])
      end
    end

    context 'with mappable columns' do
      let(:mappable_values) do
        {
          dimensions: {
            owner_id: map_client.id
          }
        }
      end
      it 'maps values according to provided mappable_values' do
        import = described_class.new(
          json_file_content: json_file_content_with_hmac.to_json,
          mappable_values: mappable_values
        )

        expect { import.import! }.to change { Dimension.count }.by(1)
        expect(Dimension.last.owner_id).to eq(map_client.id)
      end
    end

    context 'when creating new resources' do
      it 'creates new records with correct attributes' do
        importer = described_class.new(json_file_content: json_file_content_with_hmac.to_json)

        expect { importer.import! }.to change(Dimension, :count).by(1).
          and change(Factor, :count).by(1)

        dimension = Dimension.find_by(id: 585)
        expect(dimension.name).to eq('test_dimension')
        expect(dimension.disabled).to be false

        factor = Factor.find_by(id: 11_696)
        expect(factor.name).to eq('test_factor')
        expect(factor.dimension_id).to eq(585)
      end
    end

    context 'when updating existing resources' do
      let!(:existing_dimension) do
        Dimension.create!(
          id: 585,
          name: 'old_name',
          disabled: true
        )
      end

      it 'updates existing records with new attributes' do
        importer = described_class.new(json_file_content: json_file_content_with_hmac.to_json)

        expect { importer.import! }.not_to change(Dimension, :count)

        existing_dimension.reload
        expect(existing_dimension.name).to eq('test_dimension')
        expect(existing_dimension.disabled).to be false
      end
    end

    context 'when handling attachments' do
      let(:factor) { Factor.find_by(id: 11_696) }

      it 'attaches files to records' do
        importer = described_class.new(json_file_content: json_file_content_with_hmac.to_json)

        expect { importer.import! }.to change(Factor, :count).by(1)

        expect(factor.icon).to be_attached
        expect(factor.icon.filename.to_s).to eq('test.png')
      end

      context 'when attachment download fails' do
        before do
          stub_request(:get, 'http://example.com/test.png').
            to_raise(StandardError.new('Download failed'))
        end

        it 'adds to the errors' do
          importer = described_class.new(json_file_content: json_file_content_with_hmac.to_json)
          expect(importer.import!).to eq(['Failed to import icon: Download failed'])
        end
      end
    end
  end
end

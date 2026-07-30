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

        it 'completes the import successfully and skips the attachment' do
          importer = described_class.new(json_file_content: json_file_content_with_hmac.to_json)
          expect(importer.import!).to be_nil
          factor = Factor.find_by(id: 11_696)
          expect(factor).to be_present
          expect(factor.icon).not_to be_attached
        end
      end
    end

    context 'when importing a dimension with occupation condition sets (cross-env)' do
      let(:source_dimension_id) { 9_100_001 }
      let(:source_ocs_id) { 9_100_002 }

      let(:json_file_content) do
        {
          meta: {
            resource_import_order: %i[dimensions occupation_condition_sets]
          },
          resources: {
            dimensions: {
              model: 'Dimension',
              schema: [
                { name: :id, type: ['primitive'] },
                { name: :name, type: ['primitive'] },
                { name: :occupations_enabled, type: ['primitive'] },
                { name: :default_occupation_condition_set_id, type: %w[deferred_relationship relationship],
                  model: 'OccupationConditionSet' }
              ],
              data: {
                id: source_dimension_id,
                name: 'imported_dimension',
                occupations_enabled: true,
                default_occupation_condition_set_id: source_ocs_id
              }
            },
            occupation_condition_sets: {
              model: 'OccupationConditionSet',
              schema: [
                { name: :id, type: ['primitive'] },
                { name: :name, type: ['primitive'] },
                { name: :dimension_id, type: ['relationship'] }
              ],
              data: [
                {
                  id: source_ocs_id,
                  name: 'Default',
                  dimension_id: source_dimension_id
                }
              ]
            }
          }
        }
      end

      it 'imports dimension and OCS without triggering the auto-create callback' do
        importer = described_class.new(json_file_content: json_file_content_with_hmac.to_json)

        expect { importer.import! }.to change(Dimension, :count).by(1).
          and change(OccupationConditionSet, :count).by(1)
      end

      it 'sets default_occupation_condition_set_id via deferred update after OCS is imported' do
        importer = described_class.new(json_file_content: json_file_content_with_hmac.to_json)
        importer.import!

        dimension = Dimension.find_by(id: source_dimension_id)
        expect(dimension.default_occupation_condition_set_id).to eq(source_ocs_id)
      end

      it 'creates OCS with correct attributes' do
        importer = described_class.new(json_file_content: json_file_content_with_hmac.to_json)
        importer.import!

        ocs = OccupationConditionSet.find_by(id: source_ocs_id)
        expect(ocs).to be_present
        expect(ocs.name).to eq('Default')
        expect(ocs.dimension_id).to eq(source_dimension_id)
      end

      it 'rolls back the entire import if an error occurs' do
        allow_any_instance_of(OccupationConditionSet).to receive(:save!).and_raise(ActiveRecord::RecordInvalid)

        importer = described_class.new(json_file_content: json_file_content_with_hmac.to_json)
        errors = importer.import!

        expect(errors).not_to be_empty
        expect(Dimension.find_by(id: source_dimension_id)).to be_nil
      end
    end

    context 'when updating an existing dimension that already has an OCS' do
      let(:source_dimension_id) { 9_200_001 }
      let(:source_ocs_id) { 9_200_002 }
      let(:new_ocs_id) { 9_200_003 }

      let!(:existing_dimension) { create(:dimension, id: source_dimension_id, occupations_enabled: false) }
      let!(:existing_ocs) do
        OccupationConditionSet.create!(id: source_ocs_id, name: 'Default', dimension: existing_dimension)
      end

      before do
        ActsAsTenant.with_mutable_tenant do
          existing_dimension.update_columns(occupations_enabled: true,
                                            default_occupation_condition_set_id: source_ocs_id)
        end
      end

      let(:json_file_content) do
        {
          meta: {
            resource_import_order: %i[dimensions occupation_condition_sets]
          },
          resources: {
            dimensions: {
              model: 'Dimension',
              schema: [
                { name: :id, type: ['primitive'] },
                { name: :name, type: ['primitive'] },
                { name: :occupations_enabled, type: ['primitive'] },
                { name: :default_occupation_condition_set_id, type: %w[deferred_relationship relationship],
                  model: 'OccupationConditionSet' }
              ],
              data: {
                id: source_dimension_id,
                name: 'updated_dimension',
                occupations_enabled: true,
                default_occupation_condition_set_id: new_ocs_id
              }
            },
            occupation_condition_sets: {
              model: 'OccupationConditionSet',
              schema: [
                { name: :id, type: ['primitive'] },
                { name: :name, type: ['primitive'] },
                { name: :dimension_id, type: ['relationship'] }
              ],
              data: [
                { id: source_ocs_id, name: 'Default', dimension_id: source_dimension_id },
                { id: new_ocs_id, name: 'Custom Set', dimension_id: source_dimension_id }
              ]
            }
          }
        }
      end

      it 'updates default_occupation_condition_set_id to the new OCS' do
        importer = described_class.new(json_file_content: json_file_content_with_hmac.to_json)
        importer.import!

        existing_dimension.reload
        expect(existing_dimension.default_occupation_condition_set_id).to eq(new_ocs_id)
        expect(existing_dimension.name).to eq('updated_dimension')
      end
    end

    context 'when importing occupations_factors with occupation_condition_set references' do
      let(:source_dimension_id) { 9_300_001 }
      let(:source_ocs_id) { 9_300_002 }
      let(:source_factor_id) { 9_300_003 }
      let(:source_occupation_id) { 9_300_004 }
      let(:source_of_id) { 9_300_005 }

      let(:json_file_content) do
        {
          meta: {
            resource_import_order: %i[dimensions factors occupation_condition_sets occupations occupations_factors]
          },
          resources: {
            dimensions: {
              model: 'Dimension',
              schema: [
                { name: :id, type: ['primitive'] },
                { name: :name, type: ['primitive'] },
                { name: :occupations_enabled, type: ['primitive'] },
                { name: :default_occupation_condition_set_id, type: %w[deferred_relationship relationship],
                  model: 'OccupationConditionSet' }
              ],
              data: { id: source_dimension_id, name: 'of_test_dimension', occupations_enabled: true,
                      default_occupation_condition_set_id: source_ocs_id }
            },
            factors: {
              model: 'Factor',
              schema: [
                { name: :id, type: ['primitive'] },
                { name: :name, type: ['primitive'] },
                { name: :dimension_id, type: ['relationship'] }
              ],
              data: [{ id: source_factor_id, name: 'Test Factor', dimension_id: source_dimension_id }]
            },
            occupation_condition_sets: {
              model: 'OccupationConditionSet',
              schema: [
                { name: :id, type: ['primitive'] },
                { name: :name, type: ['primitive'] },
                { name: :dimension_id, type: ['relationship'] }
              ],
              data: [{ id: source_ocs_id, name: 'Default', dimension_id: source_dimension_id }]
            },
            occupations: {
              model: 'Occupation',
              schema: [
                { name: :id, type: ['primitive'] },
                { name: :name, type: ['primitive'] },
                { name: :dimension_id, type: ['relationship'] }
              ],
              data: [{ id: source_occupation_id, name: 'Test Occupation', dimension_id: source_dimension_id }]
            },
            occupations_factors: {
              model: 'OccupationsFactor',
              schema: [
                { name: :id, type: ['primitive'] },
                { name: :occupation_id, type: ['relationship'] },
                { name: :factor_id, type: ['relationship'] },
                { name: :occupation_condition_set_id, type: ['relationship'] },
                { name: :predicate, type: ['primitive'] },
                { name: :value, type: ['primitive'] },
                { name: :weight, type: ['primitive'] }
              ],
              data: [{
                id: source_of_id,
                occupation_id: source_occupation_id,
                factor_id: source_factor_id,
                occupation_condition_set_id: source_ocs_id,
                predicate: 'equal_to',
                value: 3.0,
                weight: 1.0
              }]
            }
          }
        }
      end

      it 'imports occupations_factors with the correct occupation_condition_set_id' do
        importer = described_class.new(json_file_content: json_file_content_with_hmac.to_json)
        result = importer.import!

        expect(result).to be_nil
        of = OccupationsFactor.find_by(id: source_of_id)
        expect(of).to be_present
        expect(of.occupation_condition_set_id).to eq(source_ocs_id)
      end
    end
  end
end

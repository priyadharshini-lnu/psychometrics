# frozen_string_literal: true

require 'rails_helper'

describe PortableData::Exports::Resources::DimensionExportDefinition do
  subject { described_class.new(dimension) }

  let(:dimension) { create(:dimension, :with_factor, :with_occupation) }

  describe '#serialize' do
    before do
      secrets = instance_double(
        'Settings::Secrets',
        import_export_secret: 'abc',
        encrypted_key: Base64.strict_encode64('a' * 32)
      )
      allow(Settings).to receive(:secrets).and_return(secrets)
    end

    it 'serializes related resources attributes with schema' do
      result = subject.serialize

      # Check the overall structure
      expect(result).to be_a(Hash)
      expect(result.keys).to match_array(%i[meta resources])

      # Check meta information
      expect(result[:meta]).to include(
        :exported_date,
        :hmac_signature,
        :last_updated_at,
        :parent_resource,
        :resource_import_order,
        :source_app
      )

      # Check resources
      expect(result[:resources]).to include(
        :dimensions,
        :factors,
        :innovation_styles,
        :occupations,
        :innovation_styles_factors,
        :occupations_factors
      )

      # Check Dimension data
      dimension_data = result[:resources][:dimensions]
      expect(dimension_data).to include(:data, :schema)
      expect(dimension_data[:data]).to include(
        :id,
        :name,
        :created_at,
        :updated_at
      )

      # Check Factor data
      factor_data = result[:resources][:factors]
      expect(factor_data[:data]).to be_an(Array)
      expect(factor_data[:data].first).to include(
        :id,
        :name,
        :dimension_id,
        :created_at,
        :updated_at
      )

      # Check Occupation data
      occupation_data = result[:resources][:occupations]
      expect(occupation_data[:data]).to be_an(Array)
      expect(occupation_data[:data].first).to include(
        :id,
        :name,
        :dimension_id,
        :created_at,
        :updated_at
      )
    end

    context 'with occupation condition sets' do
      let(:dimension) { create(:dimension, :with_factor, occupations_enabled: true) }

      it 'exports default_occupation_condition_set_id as a deferred relationship' do
        result = subject.serialize

        dimension.reload
        dimension_data = result[:resources][:dimensions]
        expect(dimension_data[:data][:default_occupation_condition_set_id]).to eq(
          dimension.default_occupation_condition_set_id
        )

        schema_entry = dimension_data[:schema].find { |s| s[:name] == :default_occupation_condition_set_id }
        expect(schema_entry[:type]).to include('deferred_relationship', 'relationship')
      end

      it 'includes occupation_condition_sets in exported resources' do
        result = subject.serialize

        expect(result[:resources]).to include(:occupation_condition_sets)
        ocs_data = result[:resources][:occupation_condition_sets]
        expect(ocs_data[:data]).to be_an(Array)
        expect(ocs_data[:data].first).to include(:id, :name, :dimension_id)
      end

      it 'does not export tenant_id or created_by_id in dimension data' do
        result = subject.serialize

        dimension_data = result[:resources][:dimensions][:data]
        expect(dimension_data).not_to have_key(:tenant_id)
        expect(dimension_data).not_to have_key(:created_by_id)
        expect(dimension_data).not_to have_key(:updated_by_id)
      end
    end

    context 'with indicators' do
      let!(:factor) { create(:factor, dimension: dimension, factor_type: :regular) }
      let!(:indicator) { create(:factor, dimension: dimension, factor_type: :indicator) }
      let!(:association) { create(:factors_sub_factor, factor: factor, sub_factor: indicator) }

      it 'exports factor_type and factors_sub_factors' do
        result = subject.serialize

        expect(result[:resources][:factors][:data].pluck(:factor_type)).to include('regular', 'indicator')
        expect(result[:resources]).to include(:factors_sub_factors)
        expect(result[:resources][:factors_sub_factors][:data].first).to include(
          factor_id: factor.id,
          sub_factor_id: indicator.id
        )
      end
    end
  end
end

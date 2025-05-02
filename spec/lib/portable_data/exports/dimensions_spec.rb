# frozen_string_literal: true

require 'rails_helper'

describe PortableData::Exports::Resources::DimensionExportDefinition do
  subject { described_class.new(dimension) }

  let(:dimension) { create(:dimension, :with_factor, :with_occupation) }

  describe '#serialize' do
    before do
      allow(Settings).to receive_message_chain(:secrets, :import_export_secret).and_return('abc')
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
  end
end

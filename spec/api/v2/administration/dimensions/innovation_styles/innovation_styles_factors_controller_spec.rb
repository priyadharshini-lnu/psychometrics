# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Dimensions::InnovationStyles::InnovationStylesFactorsController,
               type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:dimension) { create(:dimension) }
  let(:innovation_style) { create(:innovation_style, dimension: dimension) }
  let!(:factor) { create(:factor, dimension: dimension) }
  let!(:alpha_factor) { create(:factor, dimension: dimension, name: 'Alpha') }
  let!(:zeta_factor) { create(:factor, dimension: dimension, name: 'Zeta') }

  before { sign_in(superadmin) }

  describe 'GET /innovation_styles_factors' do
    let(:index_path) do
      "/api/v2/administration/dimensions/#{dimension.id}" \
        "/innovation_styles/#{innovation_style.id}/innovation_styles_factors"
    end

    let!(:less_than) do
      create(
        :innovation_styles_factor,
        innovation_style: innovation_style,
        factor: factor,
        predicate: :less_then,
        position: 2
      )
    end

    let!(:greater_than) do
      create(
        :innovation_styles_factor,
        innovation_style: innovation_style,
        factor: factor,
        predicate: :greater_then,
        position: 1
      )
    end

    let!(:alpha_record) do
      create(
        :innovation_styles_factor,
        innovation_style: innovation_style,
        factor: alpha_factor,
        predicate: :equal_to,
        position: 3
      )
    end

    let!(:zeta_record) do
      create(
        :innovation_styles_factor,
        innovation_style: innovation_style,
        factor: zeta_factor,
        predicate: :not_equal_to,
        position: 4
      )
    end

    it 'accepts sort=condition and maps it to predicate sort' do
      get index_path, params: { sort: 'condition' }

      expect(response).to have_http_status(:ok)

      predicates = JSON.parse(response.body).fetch('data').map { |item| item.dig('attributes', 'predicate') }
      expect(predicates).to include('greater_then', 'less_then')
    end

    it 'sorts by name using the related factor name' do
      get index_path, params: { sort: 'name' }

      expect(response).to have_http_status(:ok)

      factor_names = JSON.parse(response.body).fetch('data').map { |item| item.dig('attributes', 'factor_name') }
      expect(factor_names.index('Alpha')).to be < factor_names.index('Zeta')
    end

    it 'sorts by created_at' do
      alpha_record.update_columns(created_at: 2.days.ago)
      zeta_record.update_columns(created_at: 1.day.ago)

      get index_path, params: { sort: 'created_at' }

      expect(response).to have_http_status(:ok)

      response_ids = JSON.parse(response.body).fetch('data').map { |item| item.fetch('id').to_i }
      expect(response_ids.index(alpha_record.id)).to be < response_ids.index(zeta_record.id)
    end

    it 'sorts by updated_at' do
      alpha_record.update_columns(updated_at: 2.days.ago)
      zeta_record.update_columns(updated_at: 1.day.ago)

      get index_path, params: { sort: 'updated_at' }

      expect(response).to have_http_status(:ok)

      response_ids = JSON.parse(response.body).fetch('data').map { |item| item.fetch('id').to_i }
      expect(response_ids.index(alpha_record.id)).to be < response_ids.index(zeta_record.id)
    end

    it 'supports filterable_fields with descending condition sort' do
      get index_path, params: {
        filter: { filterable_fields: 'ads' },
        page: { number: 1 },
        sort: '-condition'
      }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to have_key('data')
    end

    it 'sorts by value regardless of default position ordering' do
      value_two = create(
        :innovation_styles_factor,
        innovation_style: innovation_style,
        factor: alpha_factor,
        value: 2,
        position: 2
      )
      value_three = create(
        :innovation_styles_factor,
        innovation_style: innovation_style,
        factor: zeta_factor,
        value: 3,
        position: 1
      )
      value_five = create(
        :innovation_styles_factor,
        innovation_style: innovation_style,
        factor: factor,
        value: 5,
        position: 3
      )

      get index_path, params: { sort: 'value' }

      expect(response).to have_http_status(:ok)

      response_ids = JSON.parse(response.body).fetch('data').map { |item| item.fetch('id').to_i }
      expect(response_ids.index(value_two.id)).to be < response_ids.index(value_three.id)
      expect(response_ids.index(value_three.id)).to be < response_ids.index(value_five.id)
    end
  end
end

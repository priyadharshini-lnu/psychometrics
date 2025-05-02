# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Skill::Contract do
  let(:user) { create(:user) }
  let(:project) { create(:project) }

  describe 'Search' do
    let(:valid_params) do
      {
        filter: {
          project_id_eq: project.id.to_s,
          name_cont: 'search term',
          category_in: 'technical'
        }
      }
    end

    context 'with tagged_with parameter' do
      it 'skips validation when only tagged_with is present' do
        params = {
          filter: {
            tagged_with: 'some-tag'
          }
        }
        contract = described_class::Search.new.call(params, { current_user: user, params: params })
        expect(contract.failure?).to eq(false)
      end

      it 'still validates other parameters when tagged_with is present' do
        params = {
          filter: {
            tagged_with: 'some-tag',
            all_skills: 'invalid', # should still fail validation
            name_cont: 'valid search term' # valid name_cont to avoid that validation
          }
        }
        contract = described_class::Search.new.call(params, { current_user: user, params: params })
        expect(contract.failure?).to eq(true)
        expect(contract.errors.to_hash).to eq(
          filter: { all_skills: [I18n.t('administration.skills.errors.search.invalid_all_value')] }
        )
      end

      it 'still validates category_in when tagged_with is present' do
        params = {
          filter: {
            tagged_with: 'some-tag',
            category_in: 'invalid', # should still fail validation
            name_cont: 'valid search term' # valid name_cont to avoid that validation
          }
        }
        contract = described_class::Search.new.call(params, { current_user: user, params: params })
        expect(contract.failure?).to eq(true)
        expect(contract.errors.to_hash).to eq(
          filter: { category_in: [I18n.t('administration.skills.errors.search.invalid_category')] }
        )
      end
    end

    it 'passes if all params are valid' do
      contract = described_class::Search.new.call(valid_params, { current_user: user, params: valid_params })
      expect(contract.failure?).to eq(false)
    end

    it 'passes if filter is not present' do
      params = {}
      contract = described_class::Search.new.call(params, { current_user: user, params: params })
      expect(contract.failure?).to eq(false)
    end

    it 'fails if filter is present but name_cont is missing' do
      params = {
        filter: {
          category_in: 'technical'
        }
      }
      contract = described_class::Search.new.call(params, { current_user: user, params: params })
      expect(contract.failure?).to eq(true)
      expect(contract.errors.to_hash).to include(
        filter: { name_cont: ['is required and must belonger than 3 characters'] }
      )
    end

    it 'validates minimum length for name_cont' do
      params = valid_params.deep_merge(filter: { name_cont: 'ab' }).tap { |p| p[:filter].delete(:project_id_eq) }
      contract = described_class::Search.new.call(params, { current_user: user, params: params })
      expect(contract.failure?).to eq(true)
      expect(contract.errors.to_hash).to eq(
        filter: { name_cont: [I18n.t('administration.skills.errors.search.query_too_short')] }
      )
    end

    it 'validates category values' do
      params = valid_params.deep_merge(filter: { category_in: '5' })
      contract = described_class::Search.new.call(params, { current_user: user, params: params })
      expect(contract.failure?).to eq(true)
      expect(contract.errors.to_hash).to eq(
        filter: { category_in: [I18n.t('administration.skills.errors.search.invalid_category')] }
      )
    end

    it 'validates mutual exclusivity of all and project_id_eq' do
      params = valid_params.deep_merge(filter: {
        all_skills: 'true',
        project_id_eq: project.id.to_s,
        name_cont: 'search term'
      })
      contract = described_class::Search.new.call(params, { current_user: user, params: params })
      expect(contract.failure?).to eq(true)
      expect(contract.errors.to_hash[:filter]).to include(
        I18n.t('administration.skills.errors.search.all_and_project_id_mutually_exclusive')
      )
    end

    it 'validates all parameter values' do
      params = valid_params.deep_merge(filter: { all_skills: 'invalid' })
      contract = described_class::Search.new.call(params, { current_user: user, params: params })
      expect(contract.failure?).to eq(true)
      expect(contract.errors.to_hash).to eq(
        filter: { all_skills: [I18n.t('administration.skills.errors.search.invalid_all_value')] }
      )
    end

    it 'validates global parameter values' do
      params = valid_params.deep_merge(filter: { global: 'invalid' })
      contract = described_class::Search.new.call(params, { current_user: user, params: params })
      expect(contract.failure?).to eq(true)
      expect(contract.errors.to_hash).to eq(
        filter: { global: [I18n.t('administration.skills.errors.search.invalid_global_value')] }
      )
    end

    it 'accepts valid global parameter values' do
      params = valid_params.deep_merge(filter: { global: 'true' })
      contract = described_class::Search.new.call(params, { current_user: user, params: params })
      expect(contract.failure?).to eq(false)

      params = valid_params.deep_merge(filter: { global: 'false' })
      contract = described_class::Search.new.call(params, { current_user: user, params: params })
      expect(contract.failure?).to eq(false)
    end
  end

  describe 'TagsSearch' do
    let(:valid_tags_params) do
      {
        filter: {
          project_id_eq: project.id.to_s,
          name_cont: 'tag search',
          category_in: 'technical'
        }
      }
    end

    it 'passes if all params are valid' do
      contract = described_class::TagsSearch.new.call(valid_tags_params,
                                                      { current_user: user, params: valid_tags_params })
      expect(contract.failure?).to eq(false)
    end

    it 'validates category values' do
      params = valid_tags_params.deep_merge(filter: { category_in: '5' })
      contract = described_class::TagsSearch.new.call(params, { current_user: user, params: params })

      expect(contract.failure?).to eq(true)
      expect(contract.errors.to_hash).to eq(
        filter: { category_in: [I18n.t('administration.skills.errors.search.invalid_category')] }
      )
    end

    it 'validates category_in format' do
      params = valid_tags_params.deep_merge(filter: { category_in: 'invalid_category,5,xyz' })
      contract = described_class::TagsSearch.new.call(params, { current_user: user, params: params })

      expect(contract.failure?).to eq(true)
      expect(contract.errors.to_hash).to eq(
        filter: { category_in: [I18n.t('administration.skills.errors.search.invalid_category')] }
      )
    end

    it 'allows missing project_id_eq' do
      params = valid_tags_params.deep_merge(
        filter: { project_id_eq: nil }
      )
      contract = described_class::TagsSearch.new.call(params, { current_user: user, params: params })
      expect(contract.failure?).to eq(false)
    end

    it 'allows missing all parameter' do
      params = valid_tags_params.deep_merge(
        filter: { all: nil }
      )
      contract = described_class::TagsSearch.new.call(params, { current_user: user, params: params })
      expect(contract.failure?).to eq(false)
    end

    it 'validates mutual exclusivity of all and project_id_eq' do
      params = valid_tags_params.deep_merge(filter: {
        all: 'true',
        project_id_eq: project.id.to_s,
        category_in: 'technical'
      })
      contract = described_class::TagsSearch.new.call(params, { current_user: user, params: params })

      expect(contract.failure?).to eq(true)
      expect(contract.errors.to_hash[:filter]).to include(
        I18n.t('administration.skills.errors.search.all_and_project_id_mutually_exclusive')
      )
    end

    it 'accepts valid category values as strings' do
      ['behavioral', 'technical', 'other', 'behavioral,technical', 'technical,other',
       'behavioral,technical,other'].each do |categories|
        params = valid_tags_params.deep_merge(filter: { category_in: categories })
        contract = described_class::TagsSearch.new.call(params, { current_user: user, params: params })
        expect(contract.failure?).to eq(false), "Failed for categories #{categories}"
      end
    end

    it 'validates all parameter format' do
      params = valid_tags_params.deep_merge(filter: {
        all: 'invalid',
        category_in: 'technical'
      })
      contract = described_class::TagsSearch.new.call(params, { current_user: user, params: params })

      expect(contract.failure?).to eq(true)
      expect(contract.errors.to_hash[:filter][:all]).to include('must be one of: true, false')
    end
  end
end

# frozen_string_literal: true

module Api
  module V2
    module Skill
      class Contract < Api::Base::Contract
        class Search < Api::Base::Contract
          MINIMUM_QUERY_LENGTH = 3

          json do
            optional(:filter).hash do
              required(:name_cont).filled(:string)
              optional(:project_id_eq).maybe(:string)
              optional(:all_skills).maybe(:string, included_in?: %w[true false])
              optional(:global).maybe(:string, included_in?: %w[true false])
              optional(:category_in).maybe(:string)
            end
          end

          rule('filter') do
            next if values[:filter].blank?

            if values[:filter][:all_skills] == 'true' && values[:filter][:project_id_eq].present?
              key.failure(I18n.t('administration.skills.errors.search.all_and_project_id_mutually_exclusive'))
            end
          end

          rule('filter.name_cont') do
            next if values[:filter].blank?

            if value.length < MINIMUM_QUERY_LENGTH
              key.failure(
                I18n.t('administration.skills.errors.search.query_too_short')
              )
            end
          end

          rule('filter.category_in') do
            next if values.dig(:filter, :category_in).blank?

            categories = value.split(',').map(&:strip)
            unless categories.all? { |category| category.in?(%w[behavioral technical other]) }
              key.failure(I18n.t('administration.skills.errors.search.invalid_category'))
            end
          end

          rule('filter.all_skills') do
            next if values.dig(:filter, :all_skills).blank?

            if %w[true false].exclude?(value)
              key.failure(I18n.t('administration.skills.errors.search.invalid_all_value'))
            end
          end

          rule('filter.global') do
            next if values.dig(:filter, :global).blank?

            if %w[true false].exclude?(value)
              key.failure(I18n.t('administration.skills.errors.search.invalid_global_value'))
            end
          end
        end

        class TagsSearch < Api::Base::Contract
          json do
            required(:filter).hash do
              optional(:project_id_eq).maybe(:string)
              optional(:all).maybe(:string, included_in?: %w[true false])
              required(:name_cont).filled(:string)
              optional(:category_in).maybe(:string)
            end
          end

          rule('filter') do
            if values[:filter].present? && (values[:filter][:all] == 'true' && values[:filter][:project_id_eq].present?)
              key.failure(I18n.t('administration.skills.errors.search.all_and_project_id_mutually_exclusive'))
            end
          end

          rule('filter.category_in') do
            if value.present?
              categories = value.split(',').map(&:strip)
              unless categories.all? { |category| category.in?(%w[behavioral technical other]) }
                key.failure(I18n.t('administration.skills.errors.search.invalid_category'))
              end
            end
          end

          rule('filter.all') do
            if value.present? && %w[true false].exclude?(value)
              key.failure(I18n.t('administration.skills.errors.search.invalid_all_value'))
            end
          end
        end
      end
    end
  end
end

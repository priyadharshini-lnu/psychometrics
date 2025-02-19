# frozen_string_literal: true

module Api
  module V2
    module Administration
      class SkillsController < Api::V2::Administration::BaseController
        validate_crud_requests Api::V2::Skill::Schema
        validates_request_schema :index, Api::V2::Skill::Contract::Search.new
        validates_request_schema :tags_search, Api::V2::Skill::Contract::TagsSearch.new
        include Api::V2::Administration::Concerns::Taggable

        def tags_search
          scoped_skills = Api::Administration::SkillPolicy::Scope.new(current_user, ::Skill).resolve

          all = params.dig(:filter, :all) == 'true'

          results = ::Administration::TagsSearch.new(
            scoped_skills,
            search_params,
            all: all
          ).call

          params.delete(:filter)

          jsonapi_render json: results, options: { resource: Api::V2::Administration::TagResource }
        end

        def import
          form = Api::V2::Administration::SkillImportForm.new(
            file: params[:file],
            ignore_duplicates: params[:ignore_duplicates].present?
          )

          if form.valid?
            AdminJob.call(
              :import_skills,
              { ignore_duplicates: form.ignore_duplicates },
              current_user,
              form.processed_file
            )

            render json: { message: 'Skills import job has been queued' }
          else
            render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def meta_details
          {
            permissions: lambda {
              GetPermissionsHash.call!(
                Administration::SkillPolicy,
                context[:user],
                @model,
                %w[
                  index
                  import
                ],
                { project_id: context[:project_id] }
              )
            }
          }
        end

        private

        def search_params
          s_params = params.require(:filter).permit(
            :project_id_eq,
            :category_in,
            :name_cont
          ).to_h

          s_params[:category_in] = s_params[:category_in]&.split(',')&.map(&:strip)

          s_params
        end
      end
    end
  end
end

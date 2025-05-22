# frozen_string_literal: true

module Api
  module V2
    module Administration
      class SkillsController < Api::V2::Administration::BaseController
        validate_crud_requests Api::V2::Skill::Schema
        validates_request_schema :create, Api::V2::Skill::CreateContract.new
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
            project_id: project&.id
          )

          if form.valid?
            AdminJob.call(
              :import_skills,
              { project_id: project&.id },
              current_user,
              form.file
            )

            render json: :ok
          else
            render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def export
          AdminJob.call(
            :export_skills,
            { project_id: project.id },
            current_user
          )

          render json: :ok
        end

        def import_translations
          form = Api::V2::Administration::SkillTranslationImportForm.new(
            file: params[:file],
            project_id: project.id
          )

          if form.valid?
            AdminJob.call(
              :import_skill_translations,
              { project_id: project.id },
              current_user,
              form.file
            )

            render json: :ok
          else
            render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def export_translations
          AdminJob.call(
            :export_skill_translations,
            { project_id: project.id },
            current_user
          )

          render json: :ok
        end

        def import_global
          form = Api::V2::Administration::SkillImportForm.new(
            file: params[:file],
            project_id: nil
          )

          if form.valid?
            AdminJob.call(
              :import_skills,
              { project_id: nil },
              current_user,
              form.file
            )

            render json: :ok
          else
            render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def export_global
          AdminJob.call(
            :export_skills,
            { project_id: nil },
            current_user
          )

          render json: :ok
        end

        def import_global_translations
          form = Api::V2::Administration::SkillTranslationImportForm.new(
            file: params[:file],
            project_id: nil
          )

          if form.valid?
            AdminJob.call(
              :import_skill_translations,
              { project_id: nil },
              current_user,
              form.processed_file
            )

            render json: :ok
          else
            render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def export_global_translations
          AdminJob.call(
            :export_skill_translations,
            { project_id: nil },
            current_user
          )

          render json: :ok
        end

        def meta_details
          {
            permissions: lambda {
              GetPermissionsHash.call!(
                ::Api::Administration::SkillPolicy,
                context[:user],
                @model,
                %w[
                  index
                  import
                  export
                  import_translations
                  export_translations
                  import_global
                  export_global
                  import_global_translations
                  export_global_translations
                ],
                { project_id: context[:project_id] }
              )
            }
          }
        end

        def project_id
          super || params.dig(:filter, :project_id_eq)
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

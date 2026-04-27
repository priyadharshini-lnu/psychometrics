# frozen_string_literal: true

module Api
  class V2::Administration::LibrariesController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    skip_before_action :jsonapi_request_handling, only: [:create_from_upload]
    skip_before_action :validate_request_schema, only: [:create_from_upload], raise: false
    skip_before_action :setup_custom_request, only: [:create_from_upload], raise: false
    validate_crud_requests Api::V2::Library::Schema
    before_action :set_resource, only: %i[update]

    def create
      results = Libraries::Create.call(resource_params.merge(files: file_params[:files]), current_user)
      if results[:ok]
        jsonapi_render json: results[:ok], options: {
          resource: Api::V2::Administration::LibraryResource
        }, status: :created
      else
        jsonapi_render json: { errors: results[:error] }, status: :unprocessable_entity
      end
    end

    def create_from_upload
      shared_params = create_from_upload_params.to_h
      upload_ids = shared_params.delete(:temporary_upload_ids) || []

      errors = []

      upload_ids.each do |upload_id|
        result = Libraries::CreateFromDirectUpload.call(
          shared_params.merge(temporary_upload_id: upload_id),
          current_user
        )
        errors.concat(Array(result[:error])) if result[:error]
      end

      if errors.empty?
        head :created
      else
        jsonapi_render_errors [{ detail: errors.first }], status: :unprocessable_entity
      end
    end

    def update
      @library.update!(
        file_params[:file].present? ? resource_params.merge(file: file_params[:file]) : resource_params
      )

      jsonapi_render json: @library, options: { resource: Api::V2::Administration::LibraryResource }
    end

    def context
      super.merge(
        with_parent: params.dig(:filter, :with_parent)
      )
    end

    def project_id
      params.dig(:data, :attributes, :owner_id) || @library&.owner_id
    end

    def meta_details
      {
        ancestors: lambda {
          parent_id = params.dig(:filter, :with_parent)
          return [] if parent_id.blank? || parent_id.to_i.zero?

          folder = Library.find_by(id: parent_id)
          return [] unless folder

          (folder.ancestors + [folder]).map { |a| { id: a.id.to_s, name: a.name } }
        }
      }
    end

    private

    def set_resource
      @library = Api::Administration::LibraryPolicy::Scope.new(
        current_user, Library
      ).resolve.find(params[:id])
    end

    def file_params
      params.permit(:file, files: [])
    end

    def create_from_upload_params
      params.permit(:name, :description, :parent_id, :type, :owner_id, temporary_upload_ids: [])
    end
  end
end

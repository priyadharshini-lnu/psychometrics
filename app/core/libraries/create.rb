# frozen_string_literal: true

module Libraries
  class Create < BaseCommand
    private_attr_reader :params, :current_user, :resources

    def initialize(params, current_user)
      @params = params
      @current_user = current_user
      @resources = []
    end

    def call
      files = Array(params[:files]).compact_blank
      resources = build_resources(files, params.except(:files))

      save_resources(resources)
    end

    private

    def build_resources(files, params)
      return [build_folder_resource(params)] if files.empty? && params[:type] == 'folder'

      files.filter_map { |file| build_file_resource(file, params) }
    end

    def build_file_resource(file, params)
      return unless file.is_a?(ActionDispatch::Http::UploadedFile) || file.is_a?(Rack::Test::UploadedFile)

      resource = resource_class.new(params.except(:files).merge(file: file))

      assign_common_attributes(resource)
      resource
    end

    def build_folder_resource(params)
      resource = resource_class.new(params)
      assign_common_attributes(resource)
      resource
    end

    def assign_common_attributes(resource)
      resource.created_by = current_user
      resource.updated_by = current_user
      if current_user.is?(:client_admin) && params[:owner_id].blank?
        resource.owner_id = current_user.client_admin_client_ids.first
      end
    end

    def save_resources(resources)
      ActiveRecord::Base.transaction { resources.each(&:save!) }
      broadcast :ok, resources
    rescue ActiveRecord::RecordInvalid
      broadcast :error, resources.map(&:errors)
    end

    def resource_class
      @resource_class ||= Library
    end
  end
end

# frozen_string_literal: true

module Administration
  class LibrariesController < Administration::BaseController
    prepend_before_action :set_resource_class
    before_action :set_resource, only: %i[edit update destroy sidebar]
    before_action :skip_authorization, only: [:sidebar]
    before_action :init_breadcrumbs, except: :index
    append_before_action :pundit_authorize, except: [:sidebar]
    skip_before_action :verify_authenticity_token

    # GET /administration/resources
    def index
      folder_id = params[:q].try(:[], :parent_id_in) || params[:folder_id]
      @folder = policy_scope(resource_class).find_by(id: folder_id)

      scope = policy_scope(resource_class).children_of(@folder) if @folder
      scope ||= policy_scope(resource_class).roots

      @_filter_form = scope.includes(:owner).ransack(params[:q])
      filter_form.sorts = ['type asc', 'name asc'] if filter_form.sorts.empty?
      @_resources = filter_form.result.page(params[:page])

      respond_to do |format|
        format.html
        format.js { render :index, formats: [:js] }
      end
    end

    def new
      @_resource = resource_class.new(type: params[:type], parent_id: params[:parent_id])
      @custom_header = t('administration.libraries.index.new_folder') if params[:type] == 'folder'
    end

    # GET /administration/resources/1/edit
    def edit
      add_breadcrumb resource.decorate.display_name, action: :edit, id: resource.id
    end

    def create
      files = Array(resource_params[:files]).compact_blank
      resources = build_resources(files, resource_params)

      save_resources(resources)
    end

    # PATCH/PUT /administration/resources/1
    def update
      file = Array(resource_params[:files]).compact_blank.first
      resource.updated_by = current_user
      respond_to do |format|
        if resource.update(resource_params.except(:files).tap do |resource_params|
          resource_params.merge!(file: file) if file.present?
        end)
          audit! :update, resource, payload: resource_params
          format.js
        else
          format.js { render :edit }
        end
      end
    end

    # DELETE /administration/resources/1
    def destroy
      resource.destroy
      audit! :delete, resource, payload: resource.log_attribute_for_delete
      respond_to do |format|
        format.html do
          redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
        end
        format.js
      end
    end

    private

    def init_breadcrumbs
      add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[admin root]
      add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), action: :index
    end

    def pundit_authorize
      authorize(
        resource || resource_class,
        nil,
        {
          project_id: resource&.owner_id
        }
      )
    end

    # Set model
    def set_resource_class
      @_resource_class ||= Library # rubocop:disable Naming/MemoizedInstanceVariableName
    end

    def set_resource
      @_resource = policy_scope(resource_class).find(params[:id])
    end

    def resource_params
      params.require(:resource).permit(:name, :description, :type, :parent_id, :file_cache, :owner_id, files: [])
    end

    def assign_common_attributes(resource)
      resource.created_by = current_user
      resource.updated_by = current_user
      if current_user.is?(:client_admin) && resource_params[:owner_id].blank?
        resource.owner_id = current_user.client_admin_client_ids.first
      end
    end

    def build_resources(files, params)
      return [build_folder_resource(params)] if files.empty? && params[:type] == 'folder'

      files.filter_map { |file| build_file_resource(file, params) }
    end

    def build_file_resource(file, params)
      return unless file.is_a?(ActionDispatch::Http::UploadedFile)

      resource = resource_class.new(params.except(:files).merge(file: file))
      assign_common_attributes(resource)
      resource
    end

    def build_folder_resource(params)
      resource = resource_class.new(params)
      assign_common_attributes(resource)
      resource
    end

    def save_resources(resources)
      ActiveRecord::Base.transaction { resources.each(&:save!) }
      respond_to do |format|
        if resources.all?(&:persisted?) && resources.any?
          resources.each { |res| audit! :create, res, payload: resource_params }
          format.js
        else
          format.js { render :new }
        end
      end
    rescue ActiveRecord::RecordInvalid
      respond_to do |format|
        format.js { render :new }
      end
    end
  end
end

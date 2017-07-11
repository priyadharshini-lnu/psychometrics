module Administration
  class LibrariesController < Administration::BaseController
    prepend_before_action :set_resource_class
    before_action :set_resource, only: [:edit, :update, :destroy, :sidebar]
    before_action :skip_authorization, only: [:sidebar]
    before_action :init_breadcrumbs, except: :index
    append_before_action :pundit_authorize, except: [:sidebar]
    skip_before_action :verify_authenticity_token

    # GET /administration/resources
    def index
      folder_id = params[:q].try(:[], :parent_id_in) || params[:folder_id]
      @folder = policy_scope(resource_class).find_by_id(folder_id)

      scope = policy_scope(resource_class).children_of(@folder) if @folder
      scope ||= policy_scope(resource_class).roots

      @_filter_form = scope.search(params[:q])
      filter_form.sorts = ['type asc', 'name asc'] if filter_form.sorts.empty?
      @_resources = filter_form.result.page(params[:page])

      respond_to do |format|
        format.html
        format.js { render :index, formats: [:js] }
      end
    end

    def new
      @_resource = resource_class.new(type: params[:type], parent_id: params[:parent_id])
    end

    def create
      @_resource = resource_class.new(resource_params)
      resource.owner_id = current_user.admin_clients.take.tte_id if current_user.is?(:admin)

      respond_to do |format|
        if resource.save
          format.js
        else
          format.js { render :new }
        end
      end
    end

    # GET /administration/resources/1/edit
    def edit
      add_breadcrumb resource.decorate.display_name, { action: :edit, id: resource.id }
    end

    # PATCH/PUT /administration/resources/1
    def update
      respond_to do |format|
        if resource.update(resource_params)
          format.js
        else
          format.js { render :edit }
        end
      end
    end

    # DELETE /administration/resources/1
    def destroy
      resource.destroy
      respond_to do |format|
        format.html { redirect_to(:back, success: t('.successfully', name: resource.decorate.display_name)) }
        format.js
      end
    end

    private

    def init_breadcrumbs
      add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
      add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), { action: :index }
    end

    # Set model
    def set_resource_class
      @_resource_class ||= Library
    end

    def set_resource
      @_resource = policy_scope(resource_class).find(params[:id])
    end

    def resource_params
      params.require(:resource).permit(:name, :description, :file, :type, :parent_id, :file_cache, :owner_id)
    end
  end
end

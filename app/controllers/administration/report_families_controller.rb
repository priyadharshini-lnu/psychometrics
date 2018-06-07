module Administration
  class ReportFamiliesController < Administration::ReportsController
    # GET /administration/resources
    def index
      @_filter_form = policy_scope(resource_class).search(params[:q])
      @_resources = filter_form.result.page(params[:page])
      respond_to do |format|
        format.html
        format.js { render :index, formats: [:js] }
      end
    end

    def new
      @_resource = resource_class.new
    end

    def edit
      add_breadcrumb resource.decorate.display_name, { action: :edit, id: resource.id }
    end

    def destroy
      super
    rescue ActiveRecord::InvalidForeignKey
      msg = 'You have dependent records'
      respond_to do |format|
        format.html { redirect_back(fallback_location: root_path, error: msg) }
        format.js { render :error, locals: { message: msg } }
      end
    end

    private

    def init_breadcrumbs
      add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
      add_breadcrumb I18n.t("administration.breadcrumbs.reports"), [:administration, :reports]
      add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), { action: :index }
    end

    # Set model
    def set_resource_class
      @_resource_class ||= ReportFamily
    end

    def resource_params
      params.require(:resource).permit(:name)
    end
  end
end

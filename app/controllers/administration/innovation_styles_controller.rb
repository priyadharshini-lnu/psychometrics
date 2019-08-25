module Administration
	class InnovationStylesController < Administration::BaseController
	  prepend_before_action :set_resource_class
	  before_action :set_resource, only: [:edit, :update, :destroy, :sidebar]
	  before_action :skip_authorization, only: [:sidebar]
	  before_action :set_dimension
	  append_before_action :init_breadcrumbs
	  append_before_action :pundit_authorize, except: [:sidebar]

	  def index
	    @_filter_form = policy_scope(resource_class).where(dimension_id: @dimension.id).search(params[:q])
	    @_resources   = filter_form.result.page(params[:page])

	    respond_to do |format|
	      format.html
	      format.js { render :index, formats: [:js] }
	    end
	  end

	  def new
	    @_resource = resource_class.new
	  end

	  def create
	    @_resource = @dimension.innovation_styles.new(resource_params)

	    respond_to do |format|
	      if resource.save
	        format.js
	      else
	        format.js { render :new }
	      end
	    end
	  end

	  def update
	    respond_to do |format|
	      if resource.update(resource_params)
	        format.js
	      else
	        format.js { render :edit }
	      end
	    end
	  end

	  def destroy
	    resource.destroy
	    respond_to do |format|
	      format.html do
	        redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
	      end
	      format.js
	    end
	  end

	  private

	  def set_resource_class
	    @_resource_class ||= InnovationStyle
	  end

	  def init_breadcrumbs
	    add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
	    add_breadcrumb I18n.t('administration.breadcrumbs.dimensions'), administration_dimensions_path
	    add_breadcrumb @dimension.name
	    add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), { action: :index }
	  end

	  def set_dimension
	    @dimension = Dimension.find(params[:dimension_id])
	  end

	  def resource_params
	    params.require(:resource).permit(:name, :description, :icon, :remove_icon)
	  end
	end
end

class Administration::AssessmentsController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:show, :edit, :update, :destroy, :toggle_status, :sidebar, :copy, :preview]
  before_action :skip_authorization, only: [:sidebar]
  before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]

  # GET /administration/resources
  def index
    @filterrific = initialize_filterrific(
      policy_scope(@resource_class),
      params[:filterrific],
      select_options: {
        with_category: @resource_class.options_for_with_category
      }
    ) || return

    @resources = @filterrific.find.page(params[:page])

    respond_to do |format|
      format.html
      format.js { render :index, formats: [:js] }
    end
  end

  def new
    @resource = @resource_class.new
    @resource.category = params[:with_category] if params[:with_category]
  end

  def create
    @resource = @resource_class.new(resource_params)
    respond_to do |format|
      if @resource.save
        format.js
      else
        format.js { render :new }
      end
    end
  end

  def preview
    render layout: 'empty'
  end

  def reports
    render layout: 'empty'
  end

  def show
    add_breadcrumb @resource.decorate.display_name
  end

  def edit
    add_breadcrumb @resource.decorate.display_name, { action: :edit, id: @resource.id }
  end

  def update
    respond_to do |format|
      if @resource.update(resource_params)
        format.js
      else
        format.js { render :edit }
      end
    end
  end

  def destroy
    @resource.destroy
    respond_to do |format|
      format.html { redirect_to(:back, success: t('.successfully', name: @resource.decorate.display_name)) }
      format.js
    end
  end

  # Change resources's status to active/disabled
  #
  def toggle_status
    @resource.toggle!(:disabled)
    respond_to do |format|
      format.html { redirect_to(:back, success: t('.successfully')) }
      format.js
    end
  end

  def copy
    @cloned_resource = @resource.clone
    respond_to do |format|
      if @cloned_resource.save
        format.js
      else
        format.js do
          render(:error, locals: { message: t("administration.#{@resource_class.model_name.plural}.copy.error", id: @resource.id) })
        end
      end
    end
  end

  private

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
    add_breadcrumb I18n.t("administration.breadcrumbs.#{@resource_class.model_name.plural}"), { action: :index }
  end

  # Set model
  def set_resource_class
    @resource_class ||= Assessment
  end

  def set_resource
    @resource = @resource_class.find(params[:id])
  end

  def resource_params
    params.require(:resource).permit(:name, :category, :norm_id)
  end

  # Authorisation user
  def pundit_authorize
    authorize @resource || @resource_class
  end
end

# frozen_string_literal: true

class Administration::FactorsController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: %i[edit update destroy copy toggle_status sidebar]
  before_action :skip_authorization, only: [:sidebar]
  before_action :set_dimension
  append_before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]

  def index
    @map_assessments = Assessment.select(:id, :name).where(dimension_id: @dimension.id).all.group_by(&:id)
    @_filter_form = policy_scope(resource_class).roots.with_dimension(@dimension.id).
                    includes(:sub_factors).
                    search(params[:q])

    @_resources   = filter_form.result.page(params[:page])
    respond_to do |format|
      format.html
      format.js { render :index, formats: [:js] }
    end
  end

  def new
    @_resource = resource_class.new(dimension: @dimension)
    @form = Factors::SaveForm.from_model(resource)
  end

  def create
    @_resource = @dimension.factors.new(resource_params)
    @form = Factors::SaveForm.new(resource_params)
    if @form.valid?
      resource.save!
    else
      render :new
    end
  end

  def edit
    @form = Factors::SaveForm.from_model(resource)
  end

  def update
    @map_assessments = Assessment.select(:id, :name).where(dimension_id: @dimension.id).all.group_by(&:id)
    @form = Factors::SaveForm.new(resource_params)
    resource.assign_attributes(resource_params)

    if @form.valid?
      resource.save!
    else
      render :edit
    end
  end

  # DELETE /administration/resources/1
  def destroy
    resource.destroy
    respond_to do |format|
      format.html do
        redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
      end
      format.js
    end
  end

  def copy
    respond_to do |format|
      @cloned_resource = resource.clone_and_save
      if @cloned_resource
        format.js
      else
        format.js { render :error, locals: { message: t('administration.factors.copy.error', id: resource.id) } }
      end
    end
  end

  def toggle_status
    resource.toggle(:disabled).save
    respond_to do |format|
      format.js
    end
  end

  private

  def set_resource_class
    @_resource_class ||= Factor # rubocop:disable Naming/MemoizedInstanceVariableName
  end

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[administration root]
    add_breadcrumb I18n.t('administration.breadcrumbs.dimensions'), administration_dimensions_path
    add_breadcrumb @dimension.name
    add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), action: :index
  end

  def set_dimension
    @dimension = policy_scope(Dimension).find(params[:dimension_id])
  end

  def resource_params
    params.require(:resource).permit(:id, :name, :description, :icon, :remove_icon, :dimension_id, :scoring_strategy,
                                     factors_sub_factors_attributes: %i[id weight _destroy sub_factor_id])
  end
end

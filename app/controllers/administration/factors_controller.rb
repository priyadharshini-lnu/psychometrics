# frozen_string_literal: true

class Administration::FactorsController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: %i[edit update destroy copy toggle_status sidebar]
  before_action :skip_authorization, only: [:sidebar]
  before_action :set_dimension
  append_before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]

  def index
    @filter_term = params.dig(:q, :filterable_fields)
    @map_assessments = Assessment.select(:id, :name).where(dimension_id: @dimension.id).all.group_by(&:id)
    @_filter_form = policy_scope(resource_class).with_dimension(@dimension.id).
                    includes(:sub_factors).
                    ransack(params[:q])

    @_resources = filter_form.result.page(params[:page])
    respond_to do |format|
      format.html
      format.js { render :index, formats: [:js] }
    end
  end

  def new
    @_resource = resource_class.new(dimension: @dimension)
    @form = Factors::SaveForm.from_model(resource)
    set_init_state
  end

  def create
    @_resource = @dimension.factors.new(resource_params)
    @form = Factors::SaveForm.new(resource_params)
    if @form.valid?
      resource.save!
      audit! :create, resource, payload: params
    else
      set_init_state
      render :new
    end
  end

  def edit
    @form = Factors::SaveForm.from_model(resource)
    set_init_state
  end

  def update
    @map_assessments = Assessment.select(:id, :name).where(dimension_id: @dimension.id).all.group_by(&:id)
    @form = Factors::SaveForm.new(resource_params)
    resource.assign_attributes(resource_params)

    if @form.valid?
      audit! :update, resource, payload: params
      resource.save!
    else
      set_init_state
      render :edit
    end
  end

  # DELETE /administration/resources/1
  def destroy
    audit! :delete, resource, payload: resource.try(:log_attribute_for_delete)
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
        audit! :copy, @cloned_resource, payload: { source: resource.id }
        format.js
      else
        format.js { render :error, locals: { message: t('administration.factors.copy.error', id: resource.id) } }
      end
    end
  end

  def toggle_status
    @map_assessments = Assessment.select(:id, :name).where(dimension_id: @dimension.id).all.group_by(&:id)
    resource.toggle(:disabled).save
    audit! :toggle_status, resource, payload: { disabled: resource.disabled }
    respond_to do |format|
      format.js
    end
  end

  private

  def pundit_authorize
    authorize(
      resource || resource_class,
      nil,
      {
        project_id: resource.dimension&.owner_id
      }
    )
  end

  def set_resource_class
    @_resource_class ||= Factor # rubocop:disable Naming/MemoizedInstanceVariableName
  end

  def set_init_state
    @intial_state = {
      scoringStrategies: Factor.scoring_strategies.map do |key, _|
        { key: key, value: I18n.t("administration.factors.form.scoring_strategies.#{key}") }
      end.sort_by { |strategy| strategy[:value] },
      factor: FactorSerializer.new.serialize(resource),
      errors: @form&.errors&.messages,
      factors: resource.dimension&.all_factors&.map { |factor| { key: factor.id, value: factor.name } }
    }
  end

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[admin root]
    add_breadcrumb I18n.t('administration.breadcrumbs.dimensions'), administration_dimensions_path
    add_breadcrumb @dimension.name
    add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), action: :index
  end

  def set_dimension
    @dimension = policy_scope(Dimension).find(params[:dimension_id])
  end

  def resource_params
    params.require(:resource).permit(:id, :name, :description, :icon, :purge_icon, :dimension_id, :scoring_strategy,
                                     :code, :use_percentage, :use_sub_factor_norm_score,
                                     :scale_min, :scale_max, :custom_formula, :precision,
                                     external_scoring: %i[type jsonpath],
                                     factors_sub_factors_attributes:
                                      %i[id weight _destroy sub_factor_id position predicate value])
  end
end

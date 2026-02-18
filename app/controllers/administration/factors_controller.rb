# frozen_string_literal: true

class Administration::FactorsController < Administration::BaseController
  skip_before_action :enforce_geo_restriction
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
                    without_indicators.
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

  def edit
    @form = Factors::SaveForm.from_model(resource)
    set_init_state
  end

  def create
    @_resource = @dimension.factors.new
    @form = Factors::SaveForm.new(resource_params)

    if @form.valid?
      Administration::Factors::CreateOrUpdateFactor.call(resource, @dimension, resource_params) do
        on(:ok) { audit! :create, resource, payload: params }
        on(:invalid) do
          resource.assign_attributes(resource_params.except(:factors_sub_factors_attributes,
                                                            :new_indicators_attributes))
          set_init_state
          render :new
        end
      end
    else
      resource.assign_attributes(resource_params.except(:factors_sub_factors_attributes, :new_indicators_attributes))
      set_init_state
      render :new
    end
  end

  def update
    @map_assessments = Assessment.select(:id, :name).where(dimension_id: @dimension.id).all.group_by(&:id)
    @form = Factors::SaveForm.new(resource_params)

    if @form.valid?
      Administration::Factors::CreateOrUpdateFactor.call(resource, @dimension, resource_params) do
        on(:ok) { audit! :update, resource, payload: params }
        on(:invalid) do
          resource.assign_attributes(resource_params.except(:factors_sub_factors_attributes,
                                                            :new_indicators_attributes))
          set_init_state
          render :edit
        end
      end
    else
      resource.assign_attributes(resource_params.except(:factors_sub_factors_attributes, :new_indicators_attributes))
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
        format.js { render :error, locals: { message: t('.error', id: resource.id) } }
      end
    end
  end

  def toggle_status
    @map_assessments = Assessment.select(:id, :name).where(dimension_id: @dimension.id).all.group_by(&:id)
    resource.toggle(:disabled).save
    audit! :toggle_status, resource, payload: { disabled: resource.disabled }
    respond_to(&:js)
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

  def set_init_state # rubocop:disable Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
    factor_data = FactorSerializer.new.serialize(resource)

    if @form&.errors&.any?
      submitted_sub_factors = build_factors_sub_factors_from_params
      factor_data[:factors_sub_factors] = submitted_sub_factors if submitted_sub_factors.present?
      factor_data[:child_factor_type] = determine_child_factor_type_from_params
    end

    @intial_state = {
      scoringStrategies: Factor.scoring_strategies.map do |key, _|
        { key: key, value: I18n.t("administration.factors.form.scoring_strategies.#{key}") }
      end.sort_by { |strategy| strategy[:value] },
      factor: factor_data,
      errors: @form&.errors&.messages,
      factors: resource.dimension&.all_factors&.map do |factor|
        { key: factor.id, value: factor.name, factor_type: factor.factor_type }
      end
    }
  end

  def determine_child_factor_type_from_params
    return 'regular' unless params[:resource]

    indicators = extract_params_list(params[:resource][:new_indicators_attributes])
    indicators.any? ? 'indicator' : 'regular'
  end

  def build_factors_sub_factors_from_params
    return [] unless params[:resource]

    sub_factors = extract_params_list(params[:resource][:factors_sub_factors_attributes])
    indicators = extract_params_list(params[:resource][:new_indicators_attributes])

    (sub_factors + indicators).map do |f|
      {
        id: f[:id], name: f[:name], description: f[:description],
        what_to_look_for: f[:what_to_look_for], precision: f[:precision],
        weight: f[:weight], score_min: f[:score_min], score_max: f[:score_max],
        score_definitions: f[:score_definitions], sub_factor_id: f[:sub_factor_id],
        position: f[:position], child_factor_type: f[:factor_type] || 'indicator',
        _is_new: f[:_is_new]
      }.compact
    end
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

  def extract_params_list(params_value)
    return [] if params_value.blank?

    list = params_value.respond_to?(:values) ? params_value.values : Array(params_value)
    list.select { |item| item.is_a?(ActionController::Parameters) && item[:_destroy] != '1' }
  end

  def resource_params
    params.require(:resource).permit(:id, :name, :description, :icon, :purge_icon, :dimension_id, :scoring_strategy, # rubocop:disable Rails/StrongParametersExpect
                                     :code, :use_percentage, :use_sub_factor_norm_score,
                                     :scale_min, :scale_max, :custom_formula, :precision,
                                     :score_min, :score_max, :what_to_look_for,
                                     external_scoring: %i[type jsonpath],
                                     score_definitions: %i[score definition],
                                     factors_sub_factors_attributes: [
                                       :id, :weight, :_destroy, :sub_factor_id, :position, :predicate, :value,
                                       :name, :description, :precision, :score_min, :score_max, :what_to_look_for,
                                       { score_definitions: %i[score definition] }
                                     ],
                                     new_indicators_attributes: [
                                       :id, :name, :description, :precision, :weight, :sub_factor_id, :position,
                                       :factor_type, :_is_new, :score_min, :score_max, :what_to_look_for,
                                       { score_definitions: %i[score definition] }
                                     ])
  end
end

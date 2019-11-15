# frozen_string_literal: true

module Administration
  class InnovationStylesFactorsController < Administration::BaseController
    prepend_before_action :set_resource_class
    before_action :set_resource, only: %i[edit update destroy copy toggle_status sidebar]
    before_action :skip_authorization, only: [:sidebar]
    before_action :set_dimension
    before_action :set_innovation_style
    append_before_action :init_breadcrumbs
    append_before_action :pundit_authorize, except: [:sidebar]

    def index
      search_term = params[:q].nil? ? nil : params[:q]['id_or_name']
      @_filter_form = policy_scope(resource_class).
                      where(innovation_style_id: @innovation_style.id).
                      ransack(eq_id_or_cont_name: search_term)
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
      @_resource = @innovation_style.innovation_styles_factors.new(resource_params)
      respond_to do |format|
        if resource.save
          format.js
        else
          format.js { render :new }
        end
      end
    end

    def update
      @map_assessments = Assessment.select(:id, :name).where(dimension_id: @dimension.id).all.group_by(&:id)
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
        format.html do
          redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
        end
        format.js
      end
    end

    private

    def set_resource_class
      @_resource_class ||= InnovationStylesFactor # rubocop:disable Naming/MemoizedInstanceVariableName
    end

    def init_breadcrumbs
      add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[administration root]
      add_breadcrumb I18n.t('administration.breadcrumbs.dimensions'), administration_dimensions_path
      add_breadcrumb @dimension.name
      add_breadcrumb(
        I18n.t('administration.breadcrumbs.innovation_styles'),
        administration_dimension_innovation_styles_path
      )
      add_breadcrumb @innovation_style.name
      add_breadcrumb I18n.t('administration.breadcrumbs.innovation_styles_factors'), action: :index
    end

    def set_innovation_style
      @innovation_style = InnovationStyle.find(params[:innovation_style_id])
    end

    def set_dimension
      @dimension = Dimension.find(params[:dimension_id])
    end

    def resource_params
      params.require(:resource).permit(:predicate, :value, :factor_id, :position, :weight)
    end
  end
end

# frozen_string_literal: true

module Administration
  class OccupationsController < Administration::BaseController
    prepend_before_action :set_resource_class
    before_action :set_resource, only: %i[edit update destroy sidebar]
    before_action :skip_authorization, only: [:sidebar]
    before_action :set_dimension
    append_before_action :init_breadcrumbs
    append_before_action :pundit_authorize, except: [:sidebar]

    def index
      @filter_term = params.dig(:q, :filterable_fields)
      @_filter_form = policy_scope(resource_class).
                      where(dimension_id: @dimension.id).
                      ransack(params[:q])
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
      @_resource = @dimension.occupations.new(resource_params)

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
      @_resource_class ||= Occupation # rubocop:disable Naming/MemoizedInstanceVariableName
    end

    def init_breadcrumbs
      add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[administration root]
      add_breadcrumb I18n.t('administration.breadcrumbs.dimensions'), administration_dimensions_path
      add_breadcrumb @dimension.name
      add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), action: :index
    end

    def set_dimension
      @dimension = Dimension.find(params[:dimension_id])
    end

    def resource_params
      params.require(:resource).permit(:name, :description, :full_description, :potential_areas_of_study,
                                       :key_career_tracks,
                                       :high_school_entry_roles, :diploma_qualification,
                                       :bachelors_or_masters_qualification,
                                       :icon, :remove_icon, :work_environment, :alternative_icon,
                                       :remove_alternative_icon,
                                       :indicative_roles_image, :remove_indicative_roles_image,
                                       :key_career_tracks_image,
                                       :remove_key_career_tracks_image, :color)
    end
  end
end

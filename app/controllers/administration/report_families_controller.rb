# frozen_string_literal: true

module Administration
  class ReportFamiliesController < Administration::BaseController
    prepend_before_action :set_resource_class
    before_action :set_resource, only: %i[show edit update destroy sidebar]
    before_action :skip_authorization, only: [:sidebar]
    append_before_action :init_breadcrumbs
    append_before_action :pundit_authorize, except: [:sidebar]

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

    def create
      @_resource = resource_class.new(resource_params)

      respond_to do |format|
        if resource.save
          format.js
        else
          format.js { render :new }
        end
      end
    end

    def edit
      add_breadcrumb resource.decorate.display_name, action: :edit, id: resource.id
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
    rescue ActiveRecord::InvalidForeignKey
      msg = 'You have dependent records'
      respond_to do |format|
        format.html { redirect_back(fallback_location: root_path, error: msg) }
        format.js { render :error, locals: { message: msg } }
      end
    end

    private

    def init_breadcrumbs
      add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[administration root]
      add_breadcrumb I18n.t('administration.breadcrumbs.reports'), %i[administration reports]
      add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), action: :index
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

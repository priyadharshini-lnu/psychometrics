module Administration
  class CampaignTemplatesController < Administration::BaseController
    prepend_before_action :set_resource_class
    before_action :set_resource, only: [:show, :edit, :update, :destroy, :sidebar]
    before_action :skip_authorization, only: [:sidebar]
    append_before_action :pundit_authorize

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
        format.html do
          redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.name))
        end
        format.js
      end
    end

    private

    def resource_params
      params.require(:resource).permit(:name, :assessment_id, :report_id)
    end

    def set_resource_class
      @_resource_class = ::CampaignTemplate
    end
  end
end

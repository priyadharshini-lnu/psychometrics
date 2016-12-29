module Administration
  class ProductsController < BaseController
    prepend_before_action :set_resource_class
    before_action :set_resource, only: [:show, :edit, :update, :destroy, :toggle_status, :sidebar, :copy]
    before_action :skip_authorization, only: [:sidebar]
    append_before_action :pundit_authorize

    def index
      @filter_form = policy_scope(@resource_class).search(params[:q])
      @resources = @filter_form.result.page(params[:page])

      respond_to do |format|
        format.html
        format.js { render :index, formats: [:js] }
      end
    end

    def new
      @resource = @resource_class.new
      Settings.currencies.each { |currency| @resource.prices.build(price_currency: currency) }
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

    def edit
      resource_currencies = @resource.prices.map(&:price_currency)
      Settings.currencies.each { |currency| @resource.prices.build(price_currency: currency) unless resource_currencies.include?(currency) }
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

    # DELETE /administration/resources/1
    def destroy
      @resource.destroy
      respond_to do |format|
        format.html { redirect_to(:back, success: t('.successfully', name: @resource.decorate.display_name)) }
        format.js
      end
    end

    def copy
      @cloned_resource = @resource.clone
      respond_to do |format|
        if @cloned_resource.save
          format.js
        else
          format.js { render(:error, locals: { message: t('.error', name: @resource.decorate.display_name) }) }
        end
      end
    end

    # Change resources's status to active/disabled
    #
    def toggle_status
      @resource.toggle!(:disabled)
      respond_to do |format|
        format.html { redirect_to(:back, success: t('.successfully', name: @resource.decorate.display_name)) }
        format.js
      end
    end

    private

    def resource_params
      params.require(:resource).permit(:name, :description, :image, :image_cache,
                                       prices_attributes: [:id, :cost, :price_currency],
                                       images_attributes: [:id, :image, :image_cache, :position, :_destroy],
                                       report_ids: [])
    end

    def set_resource_class
      @resource_class = ::Product
    end

    def set_resource
      @resource = policy_scope(@resource_class).find(params[:id])
    end

    def pundit_authorize
      authorize @resource || @resource_class
    end
  end
end

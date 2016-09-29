module Administration
  class ReportsController < Administration::BaseController
    prepend_before_action :set_resource_class
    before_action :set_resource, only: [:show, :edit, :update, :destroy, :copy, :toggle_status, :sidebar, :preview]
    before_action :skip_authorization, only: [:sidebar]
    before_action :init_breadcrumbs
    append_before_action :pundit_authorize, except: [:sidebar, :preview]

    # TODO: Implement token auth for preview
    skip_before_action :authenticate, only: [:preview]
    skip_before_action :authenticate_administrator!, only: [:preview]
    skip_after_action :verify_authorized, only: [:preview]

    # GET /administration/resources
    def index
      @filterrific = initialize_filterrific(
        policy_scope(@resource_class),
        params[:filterrific],
        select_options: {
          with_assessment_category: ['all', *Assessment.options_for_with_category]
        }
      ) || return
      @resources = @filterrific.find.preload(:assessment).page(params[:page])

      respond_to do |format|
        format.html
        format.js { render :index, formats: [:js] }
      end
    end

    def show
      render layout: 'layouts/report'
    end

    def new
      @resource = @resource_class.new
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

    # GET /administration/resources/1/edit
    def edit
      add_breadcrumb @resource.decorate.display_name, { action: :edit, id: @resource.id }
    end

    # PATCH/PUT /administration/resources/1
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
          format.js { render :error, locals: { message: t('.error', { name: @resource.decorate.display_name }) } }
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

    def preview
      respond_to do |format|
        format.html { render layout: 'empty' }
        format.pdf do

          tmp_folder = Rails.root.join('public/reports')
          report_url = url_for({ action: :preview, id: @resource })

          # Create dir if not exist
          Dir.mkdir(tmp_folder) unless Dir.exists?(tmp_folder)

          # Init fetcher and make screenshot
          fetcher = Screencap::Fetcher.new(report_url)
          screenshot = fetcher.fetch(output: "public/reports/#{@resource.id}_#{Time.now.to_f}.pdf")

          send_file screenshot.path, type: 'application/pdf'
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
      @resource_class ||= Report
    end

    def set_resource
      @resource = policy_scope(@resource_class).find(params[:id])
    end

    def resource_params
      params.require(:resource).permit(:name, :assessment_id)
    end

    # Authorisation user
    def pundit_authorize
      authorize @resource || @resource_class
    end
  end
end

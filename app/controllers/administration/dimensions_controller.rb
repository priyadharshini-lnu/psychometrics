class Administration::DimensionsController < Administration::BaseController
  before_action :set_dimension, only: [:edit, :update, :destroy]
  before_action :skip_policy_scope
  append_before_action :pundit_authorize, only: [:index, :new, :edit, :create, :update, :destroy]

  add_breadcrumb I18n.t('administration.breadcrumbs.home'), :administration_root_path
  add_breadcrumb I18n.t('administration.breadcrumbs.dimensions'), :administration_dimensions_path

  def index
    @filterrific = initialize_filterrific(
        Dimension,
        params[:filterrific]) || return
    @dimensions  = @filterrific.find.page(params[:page])
  end

  def new
    @dimension = Dimension.new
  end

  def create
    @dimension = Dimension.new(dimension_params)

    respond_to do |format|
      if @dimension.save
        format.js
      else
        format.js { render :new }
      end
    end
  end

  def update
    respond_to do |format|
      if @dimension.update(dimension_params)
        format.js
      else
        format.js { render :edit }
      end
    end
  end

  def destroy
    @dimension.destroy
    respond_to do |format|
      format.html
        redirect_to(
            administration_dimensions_url,
            notice: t('administration.dimensions.destroy.successfully_destroyed', id: @dimension.id)
        )
      format.json { head :no_content }
    end
  end

  private

  def set_dimension
    @dimension = Dimension.find(params[:id])
  end

  def dimension_params
    params.require(:dimension).permit(:name, :favourite)
  end

  def pundit_authorize
    authorize @dimension || :dimension
  end
end

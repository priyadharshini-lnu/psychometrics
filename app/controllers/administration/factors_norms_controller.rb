class Administration::FactorsNormsController < Administration::BaseController
  before_action :set_resource, only: [:update]
  append_before_action :pundit_authorize

  def update
    respond_to do |format|
      if @resource.update(resource_params)
        format.js { head :ok }
      else
        format.js { render plain: @resource.errors.full_messages[0], status: 400 }
      end
    end
  end

  private

  def set_resource
    @resource = FactorsNorm.find(params[:id])
  end

  def resource_params
    params.permit(:score_from, :score_to)
  end

  def pundit_authorize
    authorize @resource || FactorsNorm
  end
end

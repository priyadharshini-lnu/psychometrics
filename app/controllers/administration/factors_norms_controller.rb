class Administration::FactorsNormsController < Administration::BaseController
  before_action :set_resource, only: [:update]

  def update
    respond_to do |format|
      if @resource.update(resource_params)
        format.js
      else
        format.js { render :edit }
      end
    end
  end

  private

  def set_resource
    @resource = @resource_class.find(params[:id])
  end

  def set_dimension
    @dimension = Dimension.find(params[:dimension_id])
  end

  def resource_params
    params.require(:resource).permit(:name, :dimension_id)
  end
end

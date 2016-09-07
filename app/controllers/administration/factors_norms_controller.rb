class Administration::FactorsNormsController < Administration::BaseController
  append_before_action :pundit_authorize

  def update
    respond_to do |format|
      result = FactorsNorm.change_cell(change_cell_params)
      if result
        format.js { head :ok }
      else
        format.js { render plain: result.errors.full_messages[0], status: 400 }
      end
    end
  end

  private

  def pundit_authorize
    authorize @resource || FactorsNorm
  end

  def change_cell_params
    params.permit(:norm_id, :factor_id, :type, :level, :score_from, :score_to, :field_name, :field_value)
  end
end

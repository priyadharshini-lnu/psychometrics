class Administration::FactorsNormsController < Administration::BaseController
  append_before_action :pundit_authorize

  def update
    respond_to do |format|
      factors_norm = FactorsNorm.change_cell(change_cell_params)
      if factors_norm.valid?
        format.js { head :ok }
      else
        format.js { render plain: factors_norm.errors[:props][0], status: 400 }
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

# frozen_string_literal: true

class Administration::FactorsNormsController < Administration::BaseController
  skip_before_action :enforce_geo_restriction
  prepend_before_action :set_resource_class
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

  def update_percentile_norm
    form = Administration::Norms::PercentileNormFactor.from_params(params)
    if form.valid?
      Administration::Norms::CreateOrUpdateNorm.call!(form)
      head :ok
    else
      render json: { errors: form.errors.full_messages }, status: 400
    end
  end

  private

  def set_resource_class
    @_resource_class = FactorsNorm
  end

  def change_cell_params
    params.permit(:norm_id, :factor_id, :type, :level, :score_from, :score_to, :field_name, :field_value)
  end
end

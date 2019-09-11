# frozen_string_literal: true

class Administration::FactorsNormsController < Administration::BaseController
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

  private

  def set_resource_class
    @_resource_class = FactorsNorm
  end

  def change_cell_params
    params.permit(:norm_id, :factor_id, :type, :level, :score_from, :score_to, :field_name, :field_value)
  end
end

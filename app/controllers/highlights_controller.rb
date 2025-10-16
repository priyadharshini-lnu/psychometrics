# frozen_string_literal: true

class HighlightsController < ApplicationController
  include AuthenticateAnonymousUser

  prepend_before_action :authenticate_anonymous_user!
  before_action :set_highlight
  append_before_action :pundit_authorize

  def update
    if @highlight
      @highlight.update!(data: params[:data])
    else
      Highlight.create!(highlight_params.to_h.merge(user_id: current_user.id, data: params[:data]))
    end

    render json: :ok
  end

  private

  def set_highlight
    @highlight = Highlight.find_by(id: params[:id])
  end

  def pundit_authorize
    authorize @highlight || Highlight
  end

  def highlight_params
    params.permit(:id, :resource_type, :resource_id, :assessment_id)
  end
end

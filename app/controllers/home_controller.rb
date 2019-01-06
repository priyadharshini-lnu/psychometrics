class HomeController < ApplicationController

  def survey_instructions
    render layout: 'users_new'
  end

  def sso
    # TODO (atanych): should be implemented
    render plain: "Might be redirected to somewhere. E.g. to params[:redirect_url]"
  end
end

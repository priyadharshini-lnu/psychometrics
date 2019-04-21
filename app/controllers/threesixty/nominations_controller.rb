module Threesixty
  class NominationsController < ApplicationController
    layout 'layouts/threesixty_campaign'

    def show
      respond_to do |format|
        format.html {render 'threesixty/campaigns/show'}
      end
    end

  end
end

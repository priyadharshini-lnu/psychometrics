module Threesixty
  class ReportsController < ApplicationController
    layout 'layouts/threesixty_campaign'

    def index
      respond_to do |format|
        format.html {render 'threesixty/campaigns/show'}
      end
    end

  end
end

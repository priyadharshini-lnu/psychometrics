# frozen_string_literal: true

module Api
  module V2
    module Administration
      class UsersResultsController < BaseController
        def enforce_geo_restriction
          client = UsersResult.find(params[:id]).campaign.client
          client.check_geo_restriction!
        end
      end
    end
  end
end

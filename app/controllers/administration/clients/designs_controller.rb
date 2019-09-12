# frozen_string_literal: true

module Administration
  module Clients
    class DesignsController < Administration::ClientsController
      private

      def set_resource
        @_resource = resource_class.find(params[:client_id])
      end

      def resource_params
        params.require(:resource).permit(:subdomain, :logo, :background, :background_color,
                                         :remove_background, :remove_logo)
      end
    end
  end
end

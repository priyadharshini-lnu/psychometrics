module Api
  module V1
    class UsersController < Api::BaseController
      def create
        render json: [:create_user]
      end
      def update
        render json: [:update_user]
      end

      def sso
        render json: [:sso]
      end
    end
  end
end

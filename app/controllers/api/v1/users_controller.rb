module Api
  module V1
    class UsersController < Api::BaseController
      def create
        user = User.new(create_params)
        render json: Api::V1::UserSerializer.new(user)
      end
      def update
        render json: Api::V1::UserSerializer.new(User.last)
      end

      def sso
        render json: [:sso]
      end

      def create_params
        params.permit(:email, :first_name, :last_name, :password)
      end
    end
  end
end

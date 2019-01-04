module Api
  module V1
    class UsersController < Api::BaseController
      def create
        user = User.new(user_params)
        render json: Api::V1::UserSerializer.new(user)
      end
      def update
        user = User.new(user_params)

        render json: Api::V1::UserSerializer.new(user)
      end

      def sso
        render json: [:sso]
      end

      def user_params
        params.require(:user).permit(:email, :first_name, :last_name, :password)
      end
    end
  end
end

module Api
  module V1
    class UsersController < Api::ProjectScopeController
      def create
        user = User.new(user_params)
        render json: Api::V1::UserSerializer.new(user)
      end
      def update
        user = User.new(user_params)

        render json: Api::V1::UserSerializer.new(user)
      end

      def sso
        render json: {expires_at: Time.now, url: 'my.url.com'}
      end

      def user_params
        params.require(:user).permit(:email, :first_name, :last_name, :password)
      end
    end
  end
end

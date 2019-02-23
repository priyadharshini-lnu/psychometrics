module Api
  module V1
    class UsersController < BaseController
      def create
        form = Api::V1::Users::CreateForm.from_params(params[:user]).with_context(project: project)
        ::Users::Create.call(form, project) do
          on(:invalid) { |form| render_form_errors(form) }
          on(:ok) { |user| render json: Api::V1::UserSerializer.new(user, project: project).to_h }
        end
      end

      def update
        form = Api::V1::Users::UpdateForm.from_params(params[:user]).with_context(project: project, user: user)
        ::Users::Update.call(form, project, user) do
          on(:invalid) { |form| render_form_errors(form) }
          on(:ok) { |user| render json: Api::V1::UserSerializer.new(user, project: project).to_h }
        end
      end

      def sso
        url, expires_at = ::Users::BuildSsoUrl.call(project, user)[:ok]
        render json: { expires_at: expires_at, url: url }
      end

      def user_params
        params.require(:user).permit(:email, :first_name, :last_name, :password)
      end
    end
  end
end

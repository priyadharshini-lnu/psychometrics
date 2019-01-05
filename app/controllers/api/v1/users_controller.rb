module Api
  module V1
    class UsersController < ProjectScopeController
      def create
        form = Api::V1::Users::CreateForm.from_params(params[:user].merge(project: project))
        return render_form_errors(form) if form.invalid?

        user = ::Users::Regular.create!(form.attributes)
        ([project.id] + form.campaign_ids).each do |client_id|
          user.memberships.create!(role: Membership::MEMBER_ROLE, client_id: client_id)
        end

        render json: Api::V1::UserSerializer.new(user, project: project).to_h
      end

      def update
        form = Api::V1::Users::UpdateForm.from_params(params[:user].merge(project: project, user: user))
        return render_form_errors(form) if form.invalid?
        user.update!(user_params)
        render json: Api::V1::UserSerializer.new(user, project: project).to_h
      end

      def sso
        render json: {expires_at: Time.now, url: 'my.url.com'}
      end

      def user_params
        params.require(:user).permit(:email, :first_name, :last_name, :password)
      end

      def user
        @user ||= ::Users::Regular.find_by(project_id: params[:project_id], id: params[:id])
      end
    end
  end
end

# frozen_string_literal: true

module Users
  class MagicLinksController < Devise::MagicLinksController
    layout 'devise'

    def show
      super do
        session[:login_via_magic_link] = true
      end
    end

    def sign_in_link
      @magic_link_url = Utility::Url.generate(
        :user_magic_link_url,
        id: params[:id],
        subdomain: @current_project.subdomain,
        user: params[:user].permit(:email, :token, :remember_me)
      )
      render :sign_in_link, layout: 'empty_end_user'
    end

    def auth_options
      { scope: :user }
    end
  end
end

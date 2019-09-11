# frozen_string_literal: true

module Administration
  class ProfilesController < Administration::BaseController
    before_action :set_profile, only: %i[edit update]
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), :administration_root_path

    def edit
      authorize user
    end

    def update
      authorize user
      respond_to do |format|
        if user.update(profile_params)
          bypass_sign_in(user)
          format.html { redirect_to edit_administration_profiles_path, notice: t('.edit.success') }
        else
          format.html { render :edit }
        end
      end
    end

    private

    def set_profile
      @_user = current_user
    end

    def profile_params
      if params[:user][:password].blank?
        params[:user].delete(:password)
        params[:user].delete(:password_confirmation)
      end
      params.require(:user).permit(:first_name, :last_name, :email, :password, :password_confirmation)
    end
  end
end

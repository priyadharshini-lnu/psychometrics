# frozen_string_literal: true

module Administration
  class ProfilesController < Administration::BaseController
    before_action :set_profile, only: %i[edit update]
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), :administration_root_path

    def edit
      authorize user, nil, policy_class: UserProfilePolicy
      @form = ::Users::AdminProfileEditForm.from_model(user)
    end

    def update
      authorize user, nil, policy_class: UserProfilePolicy
      @form = ::Users::AdminProfileEditForm.from_params(profile_params)
      @user = ::Users::AdminProfileUpdate.call!(@form, current_user)
      @form.errors.merge!(@user.errors)
      if @user.valid?
        audit! :update_profile, @user, payload: params.require(:user).permit(:first_name, :last_name, :email)
        bypass_sign_in(@user)
        redirect_to edit_administration_profiles_path, notice: t('.edit.success')
      else
        render :edit
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
      params.require(:user).permit(
        :first_name, :last_name, :email,
        :password, :password_confirmation, :weekly_license_stats
      ).merge(id: current_user.id)
    end
  end
end

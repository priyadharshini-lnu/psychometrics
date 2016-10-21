class Administration::ProfilesController < Administration::BaseController
  before_action :set_profile, only: [:edit, :update]
  add_breadcrumb I18n.t('administration.breadcrumbs.home'), :administration_root_path
  before_action :skip_policy_scope

  def edit
    authorize @user
  end

  def update
    authorize @user
    respond_to do |format|
      if @user.update(profile_params)
        sign_in :administrator, @user, bypass: true
        format.html { redirect_to edit_administration_profiles_path, notice: t('.edit.success') }
      else
        format.html { render :edit }
      end
    end
  end

  private

  def set_profile
    @user = current_user
  end

  def profile_params
    params.require(:user).permit(:first_name, :last_name, :email, :password)
  end
end

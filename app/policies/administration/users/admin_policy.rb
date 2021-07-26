# frozen_string_literal: true

class Administration::Users::AdminPolicy < Administration::UserPolicy
  def send_mail?
    (@user.is?(:superadmin) || @user.has_grant?(:projects, :manage_users)) && !@record.is_anonym?
  end

  def change_password?
    (@user.is?(:superadmin) || @user.has_grant?(:projects, :manage_users)) && !@record.is_anonym?
  end
end

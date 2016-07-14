class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  enum role: { superadmin: 'superadmin', admin: 'admin', manager: 'manager', user: 'user' }

  def full_name
    if first_name.present? || last_name.present?
      "#{first_name} #{last_name}".to_s
    else
      email
    end
  end

  def can?(role)
    case role
    when :superadmin then superadmin?
    when :admin then admin? || superadmin?
    else raise 'Not impl'
    end
  end
end

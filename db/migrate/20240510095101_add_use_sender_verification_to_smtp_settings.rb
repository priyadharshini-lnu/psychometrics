class AddUseSenderVerificationToSmtpSettings < ActiveRecord::Migration[7.1]
  def change
    add_column :smtp_settings, :use_sender_verification, :boolean, default: false
  end
end

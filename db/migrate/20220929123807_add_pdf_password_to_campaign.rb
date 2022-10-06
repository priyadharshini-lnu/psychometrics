# frozen_string_literal: true

class AddPdfPasswordToCampaign < ActiveRecord::Migration[5.2]
  def change
    add_column :campaigns, :encrypted_pdf_password, :string
    add_column :campaigns, :encrypted_pdf_password_iv, :string

    DeploymentTask.add('run rake one_time:set_pdf_password_to_campaign')
  end
end

class AddThirdPartyPrivacySetting < ActiveRecord::Migration[7.1]
  def change
    remove_column :privacy_settings, :mask_data_for_third_party_assessment
    add_column :privacy_settings, :mask_identity_for_pearson, :boolean, default: false
    add_column :privacy_settings, :mask_identity_for_saville, :boolean, default: false
    add_column :privacy_settings, :mask_identity_for_hogan, :boolean, default: false
    add_column :privacy_settings, :mask_identity_for_iiht, :boolean, default: false
    add_column :privacy_settings, :mask_identity_for_examus, :boolean, default: false
  end
end

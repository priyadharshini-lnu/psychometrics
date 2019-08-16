I18n.translations || (I18n.translations = {});
I18n.translations["en"] = I18n.extend((I18n.translations["en"] || {}), {
  "activemodel": {
    "attributes": {
      "assign_report": {
        "adding_report_ids": "Report(s)",
        "is_applying_to_existing_users": "Apply these changes to existing users",
        "report_family_id": "Report Bundle"
      },
      "datasheet": {
        "file": "File (.xlsx)"
      },
      "new_assessments_client": {
        "assessment_ids": "Assessments",
        "is_applying_to_existing_users": "Apply these changes to existing users"
      },
      "regenerate_reports": {
        "report_ids": "Reports"
      },
      "update_assessment": {
        "is_applying_to_existing_users": "Apply these changes to existing users"
      }
    },
    "errors": {
      "models": {
        "assign_report": {
          "attributes": {
            "adding_report_ids": {
              "not_linked_to_report_family": "You selected Reports which are not linked to selected Report Bundle",
              "report_family_disabled": "You selected disabled Report Bundle",
              "reports_disabled": "You selected disabled Report(s)"
            },
            "removing_report_ids": {
              "not_linked_to_report_family": "You selected Reports which are not linked to selected Report Bundle"
            }
          }
        },
        "create_all": {
          "attributes": {
            "evaluators": {
              "email_duplicated": "The subject and evaluator emails are duplicated"
            },
            "subjects": {
              "email_duplicated": "Some subjects have the same email"
            }
          }
        },
        "create_one": {
          "attributes": {
            "email": {
              "already_exists": "A subject with same email already exists",
              "blank": "Email can't be blank",
              "invalid": "Email is invalid"
            },
            "evaluator_email": {
              "already_exists": "The subject with this evaluator are already connected",
              "blank": "Evaluator Email can't be blank",
              "invalid": "Evaluator Email is invalid"
            },
            "evaluator_first_name": {
              "blank": "Evaluator first name can't be blank"
            },
            "evaluator_last_name": {
              "blank": "Evaluator last name can't be blank"
            },
            "first_name": {
              "blank": "First name can't be blank"
            },
            "last_name": {
              "blank": "Last name can't be blank"
            },
            "relationship_name": {
              "blank": "Relationship can't be blank",
              "invalid": "Relationship %{name} is invalid"
            },
            "subject_email": {
              "blank": "Subject Email can't be blank",
              "invalid": "Subject Email is invalid",
              "not_exists": "Subject not found with email address %{email}"
            }
          }
        },
        "datasheet": {
          "attributes": {
            "file": {
              "email_duplicate": "There are duplicates in Email column",
              "invalid_format": "Invalid format (.xlsx)",
              "no_email_column": "File does not contain Email column"
            }
          }
        },
        "email_schedule": {
          "attributes": {
            "from": {
              "blank": "From field can't be blank"
            },
            "reply_to_email": {
              "blank": "Reply to email field can't be blank",
              "invalid": "Reply to email is invalid"
            },
            "scheduled_date": {
              "blank": "Scheduled date field can't be blank"
            }
          }
        },
        "email_template": {
          "attributes": {
            "from": {
              "blank": "From field can't be blank"
            },
            "reply_to_email": {
              "blank": "Reply to email field can't be blank",
              "invalid": "Reply to email is invalid"
            }
          }
        },
        "email_template_test_mail": {
          "attributes": {
            "to_email": {
              "blank": "Email field can't be blank",
              "invalid": "Email is invalid"
            }
          }
        },
        "import_one": {
          "attributes": {
            "email": {
              "already_exists": "A subject with same email already exists",
              "blank": "Email can't be blank",
              "invalid": "Email is invalid"
            },
            "first_name": {
              "blank": "First name can't be blank"
            },
            "last_name": {
              "blank": "Last name can't be blank"
            },
            "password": {
              "too_short": "Password is too short. Minimum 6 character required"
            }
          }
        },
        "profile": {
          "attributes": {
            "first_name": {
              "blank": "First name can't be blank"
            },
            "last_name": {
              "blank": "Last name can't be blank"
            },
            "password": {
              "too_short": "Password is too short. Minimum 6 character required"
            }
          }
        },
        "update_assessment": {
          "attributes": null
        }
      }
    },
    "models": {
      "assign_report": "Assign report Form",
      "datasheet": "Datasheet Form",
      "regenerate_reports": "Regenerate Reports",
      "update_assessment": "Update assessment Form"
    }
  },
  "activerecord": {
    "attributes": {
      "administration/assessments/assign_form": {
        "access_reports": "Access Report Rules",
        "access_reports_at": "Access Report at",
        "access_reports_at_date": "Date",
        "access_reports_at_time": "Time",
        "client_ids": "Client Tenancies",
        "manager_ids": "Managers",
        "report_ids": "Reports",
        "user_ids": "Users"
      },
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "case_study": "Case Studies",
          "hogan": "Hogan",
          "mindmill": "Mindmill",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "statuses": {
          "finished": "finished"
        },
        "timing": "Timing",
        "types": {
          "common": "TTE Assessment",
          "hogan": "Hogan",
          "mindmill": "Mindmill Assessment"
        },
        "updated_at": "Modified Date"
      },
      "assign": {
        "completed_at": "Completion Date",
        "statuses": {
          "completed": "Completed",
          "in_progress": "Resume",
          "not_started": "New",
          "overdue": "Overdue"
        }
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "account_manager": "TTE Account Manager",
        "account_manager_id": "TTE Account Manager",
        "applicable_level": "Applicable Level",
        "applicable_levels": {
          "campaign": "Campaign",
          "project": "Project",
          "sub_campaign": "Sub-Campaign"
        },
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License Expiry Date",
        "licenses_used": "License Usage",
        "location": "Location",
        "logo": "Client logo",
        "memberships_count": "Users",
        "name": "Name",
        "number": "Client Number",
        "privacy_consent": "Enable data processing consent",
        "project_manager": "TTE Project Manager",
        "project_manager_id": "TTE Project Manager",
        "report_ids": "Reports",
        "subdomain": "Subdomain",
        "types": {
          "associate": "Associate",
          "corporate": "Corporate",
          "distributer": "Distributer",
          "other": "Other",
          "partner": "Partner",
          "retail": "Retail",
          "tte": "TTE"
        },
        "updated_at": "Modified Date",
        "year": "Client Year"
      },
      "communication": {
        "created_at": "Created Date",
        "id": "ID",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. of Questions",
        "subfactors_count": "No. of Sub-Factors",
        "updated_at": "Modified Date"
      },
      "hogan_report_setting": {
        "load_report": "Load report from Hogan"
      },
      "library": {
        "created_at": "Created Date",
        "id": "ID",
        "type": "Thumbnail",
        "updated_at": "Modified Date"
      },
      "membership": {
        "active": "Active",
        "created_at": "Created Date",
        "disabled": "Disable",
        "email": "Email",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "parent": "Direct Manager",
        "parent_id": "Direct Manager",
        "report_ids": "Report IDs",
        "roles": {
          "client_admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "project_admin": "Project Admin"
        },
        "updated_at": "Modified Date",
        "user_access": "User Access"
      },
      "norm": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "occupation": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "diploma_qualification": "Diploma Qualification",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "name": "Name",
        "potential_areas_of_study": "Potential Areas of Study",
        "updated_at": "Modified Date",
        "work_environment": "Work Environment"
      },
      "occupations_factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "product": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "report": {
        "created_at": "Created Date",
        "id": "ID",
        "mindmill": "Load report from Mindmill",
        "mindmill_report": "Mindmill report",
        "updated_at": "Modified Date"
      },
      "report_family": {
        "created_at": "Created Date",
        "id": "ID",
        "updated_at": "Modified Date"
      },
      "task": {
        "active": "Active",
        "created_at": "Created Date",
        "description": "Description",
        "description_label": "DESCRIPTION",
        "factor_id": "Competency",
        "factor_id_label": "SELECT COMPETENCY",
        "id": "ID",
        "membership_id": "Assigner",
        "membership_id_label": "SELECT ASSIGNER",
        "name": "Action Item",
        "name_label": "ACTION ITEM",
        "planned_completed_at": "Due Date",
        "planned_completed_at_label": "SELECT DUE DATE",
        "priority": "Priority",
        "priority_label": "PRIORITY",
        "status": "Status",
        "status_label": "SELECT STATUS",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "Not Started",
          "overdue": "Overdue"
        },
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Client Tenancy",
        "memberships": "Client Tenancy",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "remember_me": "Remember me",
        "reset_password_token": "Reset password token",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "admins": {
            "admin": "Admin",
            "project_admin": "Project Admin",
            "regular": "Client Admin",
            "superadmin": "Super Admin"
          },
          "manager": "Manager",
          "member": "User",
          "regular": "Regular",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "unlock_token": "Unlock token",
        "updated_at": "Modified Date"
      },
      "user_form": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "parent": "Direct Manager",
        "parent_id": "Direct Manager",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "updated_at": "Modified Date"
      }
    },
    "errors": {
      "messages": {
        "admin_for_another_tte": "User already admin in another tte",
        "not_uniqueness": "Assign has already been taken",
        "record_invalid": "Validation failed: %{errors}",
        "restrict_dependent_destroy": {
          "has_many": "Cannot delete record because dependent %{record} exist",
          "has_one": "Cannot delete record because a dependent %{record} exists"
        }
      },
      "models": {
        "factors_norm": {
          "score_from_must_be_number": "Score from must be number",
          "score_to_less_than_score_from": "Score to is less than Score from",
          "score_to_must_be_number": "Score to must be number"
        },
        "license": {
          "overuse": "License %{name} ssis overused"
        },
        "report": {
          "assessments_not_hogan": "All Assessments must be Hogan type",
          "has_already_assigned": "Assessment can’t be changed since it is already assigned to the user or applicable level",
          "has_dependent_relation": "This report is assinged on users",
          "max_assessment_count": "You have reached the limit of %{max} assessments",
          "min_assessment_count": "The minimum number of assessments is %{min}"
        }
      }
    },
    "models": {
      "administration/assessments/assign_form": "Assigns Form",
      "assessment": "Assessments",
      "assign": "Assigns",
      "block": "Block",
      "client": "Clients",
      "communication": "Communication",
      "dimension": "Dimensions",
      "factor": "Factors",
      "factors_norm": "factors_norms",
      "library": "Library",
      "membership": "Membership",
      "norm": "Norms",
      "occupation": "Occupations",
      "occupations_factor": "Occupations",
      "product": "Product",
      "question": "Question",
      "report": "Report",
      "report_family": "ReportFamily",
      "task": "Tasks",
      "user": "Users",
      "user_form": "User"
    }
  },
  "administration": {
    "actions": "Actions",
    "active": "Active",
    "administrator": {
      "invitations": {
        "edit": {
          "confirm_password_label": "Confirm Password",
          "description": "To create a new password, please enter your new password in the boxes below.",
          "password_label": "Password",
          "submit": "Set New Password",
          "title": "Create password"
        }
      },
      "passwords": {
        "edit": {
          "confirm_password_label": "Confirm Password",
          "description": "To create a new password, please enter your new password in the boxes below.",
          "password_label": "Password",
          "submit": "Set New Password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "description": "Please enter your email address in the box below and click 'Reset Password'.",
          "email_label": "Email Address",
          "submit": "Reset Password",
          "title": "Forgotten Password"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "password_placeholder": "Enter your password",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": " Contact Us",
          "faqs": " FAQs",
          "privacy": "Privacy Statement",
          "terms_conditions": " Terms & Conditions"
        }
      }
    },
    "all": " - All - ",
    "any": " - Any - ",
    "assessments": {
      "assigns": {
        "create": {
          "successfully": "You successfully finished assigning %{name}"
        },
        "form": {
          "empty_client_ids": "Select clients to continue"
        },
        "new": {
          "help_block": "Select Clients and then click to the button \"Load Form\"",
          "load_form": "Load Form",
          "title": "Assign %{name} Assessment"
        },
        "users": {
          "filter": "Filter",
          "filter_form": "Filter form",
          "not_selected_users": "Not Selected Users",
          "selected_users": "Selected Users"
        }
      },
      "copy": {
        "error": "Assessment #%{name} was not copied.",
        "successfully": "Assessment %{name} was Copied Successfully."
      },
      "create": {
        "successfully": "Assessment %{name} was Created Successfully."
      },
      "dashboard": "Assessment Dashboard",
      "destroy": {
        "successfully": "Assessment %{name} was Destroyed Successfully."
      },
      "edit": {
        "header": "Assessment Settings"
      },
      "form": {
        "categories": {
          "360": "360 Feedback",
          "all": "All Categories",
          "case_study": "Case Studies",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "timing": {
          "hint": "For Example: 30 minutes to complete"
        }
      },
      "index": {
        "filterrific": {
          "with_category": {
            "360": "360 Feedback",
            "all": "All Categories",
            "case_study": "Case Studies",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "new": "Add",
        "owner": "Owner",
        "title": "Assessments",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New assessment"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
            "title": "Delete <strong>Assessment</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Assessment",
          "delete": "Delete Assessment",
          "edit": "Edit Assessment"
        }
      },
      "sidebar": {
        "assign": "Assign Assessment",
        "builder": "Questions Builder",
        "copy": "Copy Assessment",
        "destroy": "Delete Assessment",
        "disable": "Disable",
        "edit": "Assessment Settings",
        "enable": "Enable",
        "export": "Export Scoring",
        "new": "New Assessment",
        "preview": "Preview Assessment",
        "title": "Assessment's options"
      },
      "toggle_status": {
        "successfully": "Assessment %{name} was Updated Successfully."
      },
      "update": {
        "successfully": "Assessment %{name} was Updated Successfully."
      }
    },
    "assigns": {
      "create": {
        "successfully": "New assign to assessment was successfully created"
      },
      "destroy": {
        "successfully": "Assign to assessment was successfully deleted"
      },
      "index": {
        "title": "Reports"
      },
      "new": {
        "header": "Assign Assessment and Reports"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this assign?</p>",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        }
      }
    },
    "assigns_reports": {
      "edit": {
        "header": "Edit report assignment"
      }
    },
    "back": "Back",
    "base": {
      "top_sidebar": {
        "search": "Search...",
        "sign_out_message": {
          "body": "<p>Are you sure you want to log out?</p> <p>Press No if you want to continue work. Press Yes to logout current user.</p>",
          "title": "Log <strong>Out</strong> ?"
        }
      }
    },
    "blocks": {
      "destroy": {
        "successfully": "Block %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Block"
      },
      "new": {
        "header": "New Block"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Block?</p>\n",
            "title": "Delete <strong>Block</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Block?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "breadcrumbs": {
      "admins": "Admins",
      "assessments": "Assessments",
      "campaign_templates": "Campaign Templates",
      "campaigns": "Campaigns",
      "client": "Client Tenancy",
      "client_admins": "Client Admins",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "datasheets": "Datasheets",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "licenses": "Licenses",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "products": "Products",
      "project_admins": "Project Admins",
      "projects": "Projects",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "report_families": "Report Bundles",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_campaigns": "Sub Campaigns",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "bulk_reports": {
      "create": {
        "no_data": "No data is available for the report type and time range specified",
        "successfully": "The reports are being created and you will be notified via email when ready"
      },
      "download": {
        "removed": "Sorry, the file has been removed from the system after one week of storage"
      },
      "mailer": {
        "subject": "Download bulk reports"
      },
      "new": {
        "header": "Bulk Download"
      }
    },
    "cable": {
      "notification": {
        "assessment_factors": "Factors are fetched",
        "assessment_update": "Assessment is updated",
        "block_clone": "Block is copied",
        "block_create": "Block %{name} is created",
        "block_create_by_template": "Block was loaded from template",
        "block_destroy": "Block has been deleted",
        "block_move_down": "Block %{name} is moved down",
        "block_move_up": "Block %{name} is moved up",
        "block_permanent_destroy": "Block is permanently deleted",
        "block_rename": "Block is renamed",
        "block_restore": "Block is restored",
        "block_save_as_template": "Block saved as template",
        "block_unlink_template": "Block was unlinked",
        "block_update": "Block is updated",
        "comment_create": "Comment is created",
        "comment_destroy": "Comment has been deleted",
        "geo_filter": "Data filtered",
        "module_create": "Module %{name} is created",
        "module_destroy": "Module has been deleted",
        "module_insert_after": "Module is inserted after",
        "module_insert_before": "Module is inserted before",
        "module_move_down": "Module is moved down",
        "module_move_up": "Module is moved up",
        "module_rename": "Module is renamed",
        "module_update": "Module is updated",
        "page_create": "Page %{name} is created",
        "page_destroy": "Page has been deleted",
        "page_move_down": "Page %{name} is moved down",
        "page_move_up": "Page %{name} is moved up",
        "page_rename": "Page is renamed",
        "page_update": "Page is updated",
        "question_clone": "Question is copied",
        "question_create": "Question %{name} is created",
        "question_create_by_template": "Question was loaded from template",
        "question_create_from_template": "Question is created from template",
        "question_destroy": "Question has been deleted",
        "question_insert_after": "Question is inserted after",
        "question_insert_before": "Question is inserted before",
        "question_move_down": "Question is moved down",
        "question_move_up": "Question is moved up",
        "question_permanent_destroy": "Question is permanently deleted",
        "question_rename": "Question is renamed",
        "question_restore": "Question is restored",
        "question_save_as_template": "Question saved as template",
        "question_unlink_template": "Question was unlinked",
        "question_update": "Question is updated",
        "report_change_aliases": "Aliases are updated",
        "report_change_data_configuration": "Data Report Configuration was successfully updated",
        "report_change_filters": "Filters are updated",
        "report_update": "Report is updated",
        "scoring_update": "Scoring is updated",
        "trash_empty": "Trash Comment empty"
      }
    },
    "campaign_templates": {
      "base": {
        "active": "Active",
        "archived": "Archived",
        "disable": "Archive",
        "enable": "Unarchive"
      },
      "copy": {
        "error": "Client Tenancy %{name} was not copied.",
        "successfully": "Client Tenancy %{name} was successfully copied."
      },
      "create": {
        "successfully": "Client Tenancy %{name} was successfully created."
      },
      "designs": {
        "form": {
          "no_background": "No Background yet",
          "no_logo": "No Logo yet"
        }
      },
      "destroy": {
        "successfully": "Client Tenancy %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Client"
      },
      "export": {
        "admin": "Client Admin",
        "client_admins": "Client Admins",
        "report_bundle": "Report Bundle"
      },
      "index": {
        "export": "Export",
        "new": "Add",
        "title": "Campaign Templates"
      },
      "license": {
        "header": "%{name} - Edit license"
      },
      "licenses": {
        "update": {
          "duplicate_licenses": "You have duplicate licenses",
          "successfully": "Licenses successfully updated"
        }
      },
      "list": {
        "admin": "Client Admin",
        "client_admins": "Client Admins",
        "report_bundle": "Report Bundle"
      },
      "new": {
        "header": "New Client"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": {
              "0": "<p>Are you sure you want to delete?</p> <p>All Campaigns, Sub-campaigns and users will also be deleted</p>",
              "1": "<p>Are you sure you want to delete?</p> <p>All Sub-campaigns and users will also be deleted</p>",
              "2": "<p>Are you sure you want to delete?</p> <p>All users will also be deleted</p>"
            },
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "disable": {
            "body": {
              "0": "<p>Are you sure you want to archive?</p> <p>All Campaigns, Sub-campaigns and users will also be archived</p>",
              "1": "<p>Are you sure you want to archive?</p> <p>All Sub-campaigns and users will also be archived</p>",
              "2": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>",
              "3": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>"
            },
            "title": "Archive <strong>%{name}</strong> ?"
          },
          "enable": {
            "body": {
              "0": "<p>Are you sure you want to unarchive?</p>",
              "1": "<p>Are you sure you want to unarchive?</p>",
              "2": "<p>Are you sure you want to unarchive?</p>",
              "3": "<p>Are you sure you want to unarchive?</p>"
            },
            "title": "Unarchive <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Client",
          "create_admin": "Create Client Admin",
          "delete": "Delete Client",
          "disable": "Disable Client",
          "edit": "Edit Client",
          "enable": "Enable Client"
        }
      },
      "sidebar": {
        "copy": "Copy Client",
        "design": "Edit Design",
        "destroy": "Delete Client",
        "disable": "Disable",
        "edit": "Edit Client",
        "enable": "Enable",
        "licenses": "Manage Licenses",
        "new": "New Client",
        "title": "Campaign options"
      },
      "toggle_status": {
        "successfully": "Client Tenancy %{name} was successfully updated."
      },
      "update": {
        "successfully": "Client Tenancy %{name} was successfully updated."
      },
      "url": "Url"
    },
    "choose": " - Choose - ",
    "clear": "Clear",
    "clients": {
      "api_keys": {
        "create": {
          "successfully": "New API key was successfully created."
        },
        "index": {
          "breadcrumb": "%{name}'s API keys",
          "new": "Create new API key",
          "title": "%{name}'s API keys"
        },
        "list": {
          "active": "Active",
          "created_at": "Created",
          "key": "Key",
          "token": "Token",
          "updated_at": "Last modified"
        },
        "resource": {
          "confirmations": {
            "create": {
              "body": "<p>Are you sure you want to create a new API key?</p>\n",
              "title": "<strong>Create</strong> a new API key?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this API key?</p>\n",
              "title": "<strong>%{status}</strong> API key?"
            }
          },
          "copy": "Copy",
          "show_and_copy": "Show and Copy"
        },
        "toggle_status": {
          "successfully": "API key was successfully updated."
        }
      },
      "assessments": {
        "assigns": {
          "form": {
            "empty_client_ids": "Select clients to continue"
          }
        },
        "copy": {
          "error": "Assessment #%{name} was not copied.",
          "successfully": "Assessment %{name} was Copied Successfully."
        },
        "create": {
          "successfully": "Assessment %{name} was Created Successfully."
        },
        "dashboard": "Assessment Dashboard",
        "destroy": {
          "successfully": "Assessment %{name} was Destroyed Successfully."
        },
        "edit": {
          "header": "Assessment Settings"
        },
        "form": {
          "categories": {
            "360": "360 Feedback",
            "all": "All Categories",
            "case_study": "Case Studies",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          },
          "timing": {
            "hint": "For Example: 30 minutes to complete"
          }
        },
        "index": {
          "filterrific": {
            "with_category": {
              "360": "360 Feedback",
              "all": "All Categories",
              "case_study": "Case Studies",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "new": "Add",
          "owner": "Owner",
          "title": "Assessments",
          "tooltips": {
            "create": "Create"
          }
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New assessment"
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
              "title": "Delete <strong>Assessment</strong> ?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "export_results": "Export results",
          "normed_results": "Normed results",
          "raw_results": "Raw results",
          "scoring_results": "Scoring results",
          "tooltips": {
            "copy": "Copy Assessment",
            "delete": "Delete Assessment",
            "edit": "Edit Assessment"
          }
        },
        "sidebar": {
          "assign": "Assign Assessment",
          "builder": "Questions Builder",
          "copy": "Copy Assessment",
          "destroy": "Delete Assessment",
          "disable": "Disable",
          "edit": "Assessment Settings",
          "enable": "Enable",
          "export": "Export Scoring",
          "new": "New Assessment",
          "preview": "Preview Assessment",
          "title": "Assessment's options"
        },
        "toggle_status": {
          "successfully": "Assessment %{name} was Updated Successfully."
        },
        "update": {
          "successfully": "Assessment %{name} was Updated Successfully."
        }
      },
      "assign_assessments": {
        "confirm_remove_dependent_reports": {
          "body": "Removing assessment(s) will also remove the following reports: %{report_names}",
          "title": "Are you sure want to remove <b>Assessments</b>?"
        },
        "edit": {
          "header": "Manage assigned Assessments"
        },
        "form": {
          "apply_to_existing_users_hint": "(If is not selected, changes will be applied only to new users)"
        },
        "form_edit": {
          "apply_to_existing_users_hint": "(If is not selected, changes will be applied only to new users)",
          "name": "Assessment name",
          "remove": "Remove"
        },
        "new": {
          "header": "Add Assessments"
        }
      },
      "assign_reports": {
        "edit": {
          "header": "Add Reports"
        },
        "form": {
          "access": "Access",
          "apply_to_existing_users_hint": "(If is not selected, changes will be applied only to new users)",
          "reports": "Reports",
          "user_access": "User Access"
        },
        "form_edit": {
          "access": "Access",
          "added_reports": "Already assigned Reports",
          "apply_to_existing_users_hint": "(If is not selected, changes will be applied only to new users)",
          "new_reports": "Add new Reports",
          "remove": "Remove",
          "reports": "Reports",
          "user_access": "User Access"
        },
        "new": {
          "header": "Add Reports"
        }
      },
      "base": {
        "active": "Active",
        "archived": "Archived",
        "disable": "Archive",
        "enable": "Unarchive"
      },
      "campaigns": {
        "archive": {
          "successfully": "Campaign %{name} was successfully archived."
        },
        "copy": {
          "error": "Campaign %{name} was not copied.",
          "successfully": "Campaign %{name} was successfully copied."
        },
        "create": {
          "successfully": "Campaign %{name} was successfully created."
        },
        "destroy": {
          "successfully": "Campaign %{name} was successfully deleted."
        },
        "edit": {
          "header": "Edit Campaign"
        },
        "export": {
          "assigned_user": "Assigned Users",
          "completed_user": "Completed Users",
          "header": {
            "actions": "Actions",
            "actual_usage": "Actual Usage",
            "campaigns": "Campaigns",
            "name": "Name",
            "sub_campaign": "Sub-Campaigns",
            "tests_allocated": "Tests Allocated",
            "users": "Users"
          },
          "name": "Campaign Name"
        },
        "index": {
          "export": "Export",
          "new": "Add",
          "title": "Campaigns"
        },
        "list": {
          "assigned_user": "Assigned Users",
          "completed_user": "Completed Users",
          "header": {
            "actions": "Actions",
            "actual_usage": "Actual Usage",
            "campaigns": "Campaigns",
            "name": "Name",
            "sub_campaign": "Sub-Campaigns",
            "tests_allocated": "Tests Allocated",
            "users": "Users"
          },
          "name": "Campaign Name"
        },
        "new": {
          "header": "New Campaign"
        },
        "resource": {
          "sub_campaign": {
            "create": "Create New Sub-Campaign"
          },
          "tooltips": {
            "copy": "Copy Campaign",
            "create_report": "Add New Report",
            "create_user": "Add New User",
            "delete": "Delete Campaign",
            "edit": "Edit Campaign",
            "export": "Export"
          }
        },
        "sidebar": {
          "archive": "Archive Campaign",
          "copy": "Copy Campaign",
          "destroy": "Delete Campaign",
          "disable": "Disable",
          "edit": "Edit Campaign",
          "enable": "Enable",
          "new": "New Campaign",
          "title": "Campaign's options"
        },
        "toggle_status": {
          "successfully": "Campaign %{name} was successfully updated."
        },
        "update": {
          "successfully": "Campaign %{name} was successfully updated."
        }
      },
      "client_admins": {
        "create": {
          "successfully": "User %{name} was successfully created."
        },
        "destroy": {
          "successfully": "User %{name} was successfully deleted."
        },
        "edit": {
          "add": "Add",
          "grants": "Privileges",
          "hris_data": "HRIS Data",
          "key": "Key",
          "personal_data": "Personal Data",
          "remove": "Remove",
          "title": "Edit user",
          "value": "Value"
        },
        "form": {
          "choose": " - Choose - ",
          "choose_admin": "Choose Admin",
          "create_admin": "Create Admin"
        },
        "index": {
          "breadcrumb": "Client Admins",
          "title": "Client Admins"
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New user"
        },
        "reset_password": {
          "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
        },
        "resource": {
          "confirmations": {
            "change_password": {
              "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
              "title": "Change password <strong>%{name}</strong> ?"
            },
            "delete": {
              "body": "<p>Are you sure you want to delete this User?</p>\n",
              "title": "Delete <strong>%{name}</strong> ?"
            },
            "membership": {
              "delete": {
                "body": "<p>Are you sure you want to delete?</p>\n",
                "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
              }
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this User?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "change_password": "Change Password",
            "chart": "View user report",
            "delete": "Delete User",
            "edit": "Edit User",
            "mail": "Send Mail",
            "sign_in": "Login as user"
          }
        },
        "sidebar": {
          "api_keys": "API keys",
          "assessments_and_reports": "Assessments and Reporting",
          "destroy": "Delete User",
          "disable": "Disable",
          "edit_user": "Edit User",
          "email": "Send Mail",
          "enable": "Enable",
          "export_users": "Export users",
          "import_users": "Import users",
          "login_as_user": "Login as User",
          "new_user": "New User",
          "reset_password": "Change Password",
          "title": "User's options"
        },
        "spoof": {
          "successfully": "You was successfully login as %{name}"
        },
        "toggle_status": {
          "successfully": "User %{name} was successfully updated."
        },
        "update": {
          "successfully": "User %{name} was successfully updated."
        }
      },
      "copy": {
        "error": "Client Tenancy %{name} was not copied.",
        "successfully": "Client Tenancy %{name} was successfully copied."
      },
      "create": {
        "successfully": "Client Tenancy %{name} was successfully created."
      },
      "datasheet_rows": {
        "create": {
          "successfully": "New Datasheet was successfully uploaded."
        },
        "destroy": {
          "successfully": "Datasheet Row %{name} was successfully deleted."
        },
        "index": {
          "new": "Upload datasheet",
          "title": "%{name} Datasheet"
        },
        "list": null,
        "new": {
          "header": "Upload datasheet"
        },
        "resource": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Datasheet Row?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "tooltips": {
            "delete": "Delete"
          }
        }
      },
      "designs": {
        "form": {
          "no_background": "No Background yet",
          "no_logo": "No Logo yet"
        }
      },
      "destroy": {
        "successfully": "Client Tenancy %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Client"
      },
      "export": {
        "admin": "Client Admin",
        "client_admins": "Client Admins",
        "report_bundle": "Report Bundle"
      },
      "index": {
        "export": "Export",
        "new": "Add",
        "title": "Client Tenancies"
      },
      "license": {
        "header": "%{name} - Edit license"
      },
      "license_usages": {
        "index": {
          "title": "Usage Details"
        },
        "list": {
          "campaign_name": "Campaign Name",
          "created_at": "Date",
          "id": "Usage ID",
          "subject_email": "Subject Email",
          "subject_name": "Subject Name"
        }
      },
      "licenses": {
        "create": {
          "successfully": "License was successfully created."
        },
        "edit": {
          "header": "Edit License"
        },
        "form": {
          "add_license": "Add Another License",
          "license_number": "License Number",
          "license_overuse_number": "Over Use Allowance",
          "report_family": "Report Bundle"
        },
        "index": {
          "new": "Add License",
          "report_family": "Report Bundle",
          "title": "%{client_name} - Manage Licenses"
        },
        "list": {
          "date_expire": "Date Of Expiry: %{date}",
          "end_date": "End Date",
          "header": "%{client_name} - Licenses Usage",
          "license_has_expired": "License package has expired",
          "license_type": "License Type",
          "report_family": "Report Bundle",
          "start_date": "Start Date",
          "usage_percent": "% of Usage",
          "used_license_number": "Used Licenses",
          "used_license_overuse_number": "Over Use Allowance",
          "used_out_of": "%{used_number} out of %{number}"
        },
        "mailer": {
          "license_expire": {
            "subject": "License expired"
          },
          "license_overuse": {
            "subject": "License overuse"
          }
        },
        "new": {
          "header": "Add License"
        },
        "overview": {
          "date_expire": "Date Of Expiry: %{date}",
          "end_date": "End Date",
          "header": "%{client_name} - Licenses Usage",
          "license_has_expired": "License package has expired",
          "license_type": "License Type",
          "report_family": "Report Bundle",
          "start_date": "Start Date",
          "usage_percent": "% of Usage",
          "used_license_number": "Used Licenses",
          "used_license_overuse_number": "Over Use Allowance",
          "used_out_of": "%{used_number} out of %{number}"
        },
        "resource": {
          "confirmations": {
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this License?</p>\n",
              "title": "<strong>%{status}</strong> License for %{name}?"
            }
          },
          "tooltips": {
            "edit": "Edit License"
          }
        },
        "show": {
          "date_expire": "Date Of Expiry: %{date}",
          "end_date": "End Date",
          "header": "%{client_name} - Licenses Usage",
          "license_has_expired": "License package has expired",
          "license_type": "License Type",
          "report_family": "Report Bundle",
          "start_date": "Start Date",
          "usage_percent": "% of Usage",
          "used_license_number": "Used Licenses",
          "used_license_overuse_number": "Over Use Allowance",
          "used_out_of": "%{used_number} out of %{number}"
        },
        "toggle_status": {
          "successfully": "Status of License was successfully updated."
        },
        "update": {
          "duplicate_licenses": "You have duplicate licenses",
          "successfully": "Licenses successfully updated"
        }
      },
      "list": {
        "admin": "Client Admin",
        "client_admins": "Client Admins",
        "report_bundle": "Report Bundle"
      },
      "new": {
        "header": "New Client"
      },
      "project_admins": {
        "create": {
          "successfully": "User %{name} was successfully created."
        },
        "destroy": {
          "successfully": "User %{name} was successfully deleted."
        },
        "edit": {
          "add": "Add",
          "grants": "Privileges",
          "hris_data": "HRIS Data",
          "key": "Key",
          "personal_data": "Personal Data",
          "remove": "Remove",
          "title": "Edit user",
          "value": "Value"
        },
        "form": {
          "choose": " - Choose - ",
          "choose_admin": "Choose Admin",
          "create_admin": "Create Admin"
        },
        "index": {
          "breadcrumb": "Project Admins",
          "title": "Project Admins"
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New user"
        },
        "reset_password": {
          "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
        },
        "resource": {
          "confirmations": {
            "change_password": {
              "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
              "title": "Change password <strong>%{name}</strong> ?"
            },
            "delete": {
              "body": "<p>Are you sure you want to delete this User?</p>\n",
              "title": "Delete <strong>%{name}</strong> ?"
            },
            "membership": {
              "delete": {
                "body": "<p>Are you sure you want to delete?</p>\n",
                "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
              }
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this User?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "change_password": "Change Password",
            "chart": "View user report",
            "delete": "Delete User",
            "edit": "Edit User",
            "mail": "Send Mail",
            "sign_in": "Login as user"
          }
        },
        "sidebar": {
          "api_keys": "API keys",
          "assessments_and_reports": "Assessments and Reporting",
          "destroy": "Delete User",
          "disable": "Disable",
          "edit_user": "Edit User",
          "email": "Send Mail",
          "enable": "Enable",
          "export_users": "Export users",
          "import_users": "Import users",
          "login_as_user": "Login as User",
          "new_user": "New User",
          "reset_password": "Change Password",
          "title": "User's options"
        },
        "spoof": {
          "successfully": "You was successfully login as %{name}"
        },
        "toggle_status": {
          "successfully": "User %{name} was successfully updated."
        },
        "update": {
          "successfully": "User %{name} was successfully updated."
        }
      },
      "projects": {
        "archive": {
          "successfully": "Project %{name} was successfully archived."
        },
        "assign_assessments": {
          "add_assessment": "Add Assessment",
          "assessments": "Assessments"
        },
        "assign_reports": {
          "add_report": "Add Report"
        },
        "campaigns": {
          "archive": {
            "successfully": "Campaign %{name} was successfully archived."
          },
          "copy": {
            "error": "Campaign %{name} was not copied.",
            "successfully": "Campaign %{name} was successfully copied."
          },
          "create": {
            "successfully": "Campaign %{name} was successfully created."
          },
          "destroy": {
            "successfully": "Campaign %{name} was successfully deleted."
          },
          "edit": {
            "header": "Edit Campaign"
          },
          "export": {
            "assigned_user": "Assigned Users",
            "completed_user": "Completed Users",
            "header": {
              "actions": "Actions",
              "actual_usage": "Actual Usage",
              "campaigns": "Campaigns",
              "name": "Name",
              "sub_campaign": "Sub-Campaigns",
              "tests_allocated": "Tests Allocated",
              "users": "Users"
            },
            "name": "Campaign Name"
          },
          "index": {
            "export": "Export",
            "new": "Add",
            "title": "Campaigns"
          },
          "list": {
            "assigned_user": "Assigned Users",
            "completed_user": "Completed Users",
            "header": {
              "actions": "Actions",
              "actual_usage": "Actual Usage",
              "campaigns": "Campaigns",
              "name": "Name",
              "sub_campaign": "Sub-Campaigns",
              "tests_allocated": "Tests Allocated",
              "users": "Users"
            },
            "name": "Campaign Name"
          },
          "new": {
            "header": "New Campaign"
          },
          "resource": {
            "sub_campaign": {
              "create": "Create New Sub-Campaign"
            },
            "tooltips": {
              "copy": "Copy Campaign",
              "create_report": "Add New Report",
              "create_user": "Add New User",
              "delete": "Delete Campaign",
              "edit": "Edit Campaign",
              "export": "Export"
            }
          },
          "sidebar": {
            "archive": "Archive Campaign",
            "copy": "Copy Campaign",
            "destroy": "Delete Campaign",
            "disable": "Disable",
            "edit": "Edit Campaign",
            "enable": "Enable",
            "new": "New Campaign",
            "title": "Campaign's options"
          },
          "sub_campaigns": {
            "archive": {
              "successfully": "Sub-Campaign %{name} was successfully archived."
            },
            "copy": {
              "error": "Sub-Campaign %{name} was not copied.",
              "successfully": "Sub-Campaign %{name} was successfully copied."
            },
            "create": {
              "successfully": "Sub-Campaign %{name} was successfully created."
            },
            "destroy": {
              "successfully": "Sub-Campaign %{name} was successfully deleted."
            },
            "edit": {
              "header": "Edit Sub-Campaign"
            },
            "export": {
              "assigned_user": "Assigned Users",
              "completed_user": "Completed Users",
              "header": {
                "actions": "Actions",
                "actual_usage": "Actual Usage",
                "archive_status": "Archive Status",
                "name": "Name",
                "sub_campaign": "Sub-Campaigns",
                "tests_allocated": "Tests Allocated",
                "users": "Users"
              },
              "name": "Sub-Campaign Name"
            },
            "header": {
              "actions": "Actions"
            },
            "index": {
              "export": "Export",
              "new": "Add",
              "title": "Sub Campaigns"
            },
            "list": {
              "assigned_user": "Assigned Users",
              "completed_user": "Completed Users",
              "header": {
                "actions": "Actions",
                "actual_usage": "Actual Usage",
                "archive_status": "Archive Status",
                "name": "Name",
                "sub_campaign": "Sub-Campaigns",
                "tests_allocated": "Tests Allocated",
                "users": "Users"
              },
              "name": "Sub-Campaign Name"
            },
            "new": {
              "header": "New Sub-Campaign"
            },
            "resource": {
              "tooltips": {
                "copy": "Copy Sub Campaign",
                "create_report": "Add new Report",
                "create_user": "Add New User",
                "delete": "Delete Sub Campaign",
                "edit": "Edit Sub Campaign"
              }
            },
            "sidebar": {
              "archive": "Archive Sub-Campaign",
              "copy": "Copy Sub-Campaign",
              "destroy": "Delete Sub-Campaign",
              "disable": "Disable",
              "edit": "Edit Sub-Campaign",
              "enable": "Enable",
              "new": "New Sub-Campaign",
              "title": "Sub-Campaign's options"
            },
            "toggle_status": {
              "successfully": "Sub-Campaign %{name} was successfully updated."
            },
            "update": {
              "successfully": "Sub-Campaign %{name} was successfully updated."
            }
          },
          "toggle_status": {
            "successfully": "Campaign %{name} was successfully updated."
          },
          "update": {
            "successfully": "Campaign %{name} was successfully updated."
          }
        },
        "copy": {
          "error": "Project %{name} was not copied.",
          "successfully": "Project %{name} was successfully copied."
        },
        "create": {
          "successfully": "Project %{name} was successfully created."
        },
        "destroy": {
          "successfully": "Project %{name} was successfully deleted."
        },
        "edit": {
          "header": "Edit Project"
        },
        "export": {
          "actual_usage": "Actual Usage",
          "admin": "Client Admin",
          "applicable_level": "Applicable Level",
          "archive_status": "Status",
          "assessments": "Assessments",
          "assigned_user": "Assigned Users",
          "completed_user": "Completed users",
          "created_at": "Created Date",
          "name": "Project name",
          "project_admin": "Project Admins",
          "reports": "Reports",
          "tests_allocated": "Tests Allocated",
          "tte_admin": "TTE Project Manager",
          "updated_at": "Modified Date",
          "url": "URL",
          "users_count": "Users Count"
        },
        "form": {
          "applicable_levels": {
            "campaign": "Campaign End Level",
            "project": "Project End Level",
            "sub_campaign": "Sub-Campaign End Level"
          },
          "data_privacy": "Data privacy",
          "project_number": "Project Number"
        },
        "header": {
          "actions": "Actions"
        },
        "index": {
          "export": "Export",
          "new": "Add",
          "title": "Projects",
          "tooltips": {
            "create": "Create",
            "export": "Export"
          }
        },
        "list": {
          "actual_usage": "Actual Usage",
          "admin": "Client Admin",
          "applicable_level": "Applicable Level",
          "archive_status": "Status",
          "assessments": "Assessments",
          "assigned_user": "Assigned Users",
          "completed_user": "Completed users",
          "created_at": "Created Date",
          "name": "Project name",
          "project_admin": "Project Admins",
          "reports": "Reports",
          "tests_allocated": "Tests Allocated",
          "tte_admin": "TTE Project Manager",
          "updated_at": "Modified Date",
          "url": "URL",
          "users_count": "Users Count"
        },
        "new": {
          "header": "New Project"
        },
        "resource": {
          "add_assessment": "Add Assessment",
          "add_report": "Add Report",
          "assessments": "Assessments",
          "tooltips": {
            "copy": "Copy Project",
            "create_admin": "Create Project Admin",
            "create_report": "Add New Report",
            "create_user": "Add New User",
            "delete": "Delete Project",
            "edit": "Edit Project"
          }
        },
        "sidebar": {
          "admins": "Admin Users",
          "archive": "Archive Project",
          "copy": "Copy Project",
          "design": "Edit Design",
          "destroy": "Delete Project",
          "disable": "Disable",
          "edit": "Edit Project",
          "enable": "Enable",
          "new": "New Project",
          "title": "Project's options",
          "view_licenses": "View Licenses"
        },
        "threesixty_campaigns": {
          "base": {
            "active": "Active",
            "archived": "Archived",
            "disable": "Archive",
            "enable": "Unarchive"
          },
          "completion_statuses": {
            "approved": "Approved",
            "completed": "Completed",
            "denied": "Denied",
            "in_progress": "In Progress",
            "not_started": "Not Started"
          },
          "copy": {
            "error": "Client Tenancy %{name} was not copied.",
            "successfully": "Client Tenancy %{name} was successfully copied."
          },
          "create": {
            "successfully": "Client Tenancy %{name} was successfully created."
          },
          "designs": {
            "form": {
              "no_background": "No Background yet",
              "no_logo": "No Logo yet"
            }
          },
          "destroy": {
            "successfully": "Client Tenancy %{name} was successfully deleted."
          },
          "edit": {
            "header": "Edit 360 Campaign"
          },
          "export": {
            "admin": "Client Admin",
            "client_admins": "Client Admins",
            "report_bundle": "Report Bundle"
          },
          "index": {
            "export": "Export",
            "new": "Add 360 Campaign",
            "title": "360 Campaigns"
          },
          "license": {
            "header": "%{name} - Edit license"
          },
          "licenses": {
            "update": {
              "duplicate_licenses": "You have duplicate licenses",
              "successfully": "Licenses successfully updated"
            }
          },
          "list": {
            "admin": "Client Admin",
            "client_admins": "Client Admins",
            "report_bundle": "Report Bundle"
          },
          "new": {
            "header": "New 360 Campaign"
          },
          "resource": {
            "confirmations": {
              "delete": {
                "body": {
                  "0": "<p>Are you sure you want to delete?</p> <p>All Campaigns, Sub-campaigns and users will also be deleted</p>",
                  "1": "<p>Are you sure you want to delete?</p> <p>All Sub-campaigns and users will also be deleted</p>",
                  "2": "<p>Are you sure you want to delete?</p> <p>All users will also be deleted</p>"
                },
                "title": "Delete <strong>%{name}</strong> ?"
              },
              "disable": {
                "body": {
                  "0": "<p>Are you sure you want to archive?</p> <p>All Campaigns, Sub-campaigns and users will also be archived</p>",
                  "1": "<p>Are you sure you want to archive?</p> <p>All Sub-campaigns and users will also be archived</p>",
                  "2": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>",
                  "3": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>"
                },
                "title": "Archive <strong>%{name}</strong> ?"
              },
              "enable": {
                "body": {
                  "0": "<p>Are you sure you want to unarchive?</p>",
                  "1": "<p>Are you sure you want to unarchive?</p>",
                  "2": "<p>Are you sure you want to unarchive?</p>",
                  "3": "<p>Are you sure you want to unarchive?</p>"
                },
                "title": "Unarchive <strong>%{name}</strong> ?"
              }
            },
            "tooltips": {
              "copy": "Copy Client",
              "create_admin": "Create Client Admin",
              "delete": "Delete Client",
              "disable": "Disable Client",
              "edit": "Edit Client",
              "enable": "Enable Client"
            }
          },
          "statistics": {
            "index": {
              "all_assessments": "All assessments",
              "assessment_type": "Assessment type",
              "title": "Statistics"
            }
          },
          "toggle_status": {
            "successfully": "Client Tenancy %{name} was successfully updated."
          },
          "update": {
            "successfully": "Client Tenancy %{name} was successfully updated."
          },
          "url": "Url"
        },
        "toggle_status": {
          "successfully": "Project %{name} was successfully updated."
        },
        "update": {
          "successfully": "Project %{name} was successfully updated."
        }
      },
      "reports": {
        "copy": {
          "error": "Report #%{id} was not copied."
        },
        "create": {
          "successfully": "Report %{name} was successfully created for Client."
        },
        "destroy": {
          "successfully": "Report %{name} was successfully deleted from Client."
        },
        "edit": {
          "header": "Edit Report Name"
        },
        "form": {
          "load_mindmill_report": "Load from Mindmill",
          "none_external": "None - Use report builder",
          "select_family": "Select Report Bundle",
          "types": {
            "common": "Any",
            "eti": "ETI",
            "yti": "YTI"
          }
        },
        "index": {
          "add": "Add",
          "bulk_download": "Bulk Download",
          "families": "Report Bundles",
          "filterrific": {
            "with_assessment_category": {
              "360": "360 Feedback",
              "all": "All",
              "case_study": "Case Studies",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "owner": "Owner",
          "regenerate": "Regenerate Reports",
          "report_family": "Report Bundle",
          "title": "Reports",
          "tooltips": {
            "create": "Create"
          }
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "Select Report"
        },
        "preview": {
          "export_pdf": "Export to PDF",
          "title": "Preview"
        },
        "regenerate": {
          "successfully": "Report successfully sent for regeneration"
        },
        "regenerates": {
          "create": {
            "successfully": "Report(s) successfully sent for regeneration"
          }
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Report?</p>\n",
              "title": "Delete <strong>Report</strong> ?"
            },
            "detach": {
              "body": "<p>Are you sure you want to detach this Report?</p>\n",
              "title": "Detach <strong>Report</strong> ?"
            },
            "regenerate": {
              "body": "<p>Are you sure you want to regenerate this Report for all Users?</p>",
              "title": "Regenerate <strong>%{name}</strong>?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "copy": "Copy Report",
            "delete": "Delete Report",
            "edit": "Edit Report",
            "preview": "Preview Report"
          }
        },
        "sidebar": {
          "copy": "Copy Report",
          "destroy": "Delete Report",
          "edit": "Edit Report",
          "regenerate": "Regenerate Report",
          "title": "Report's options",
          "view": "View Report"
        },
        "toggle_status": {
          "successfully": "Report was successfully updated."
        },
        "types": {
          "common": "Any",
          "eti": "ETI",
          "yti": "YTI"
        },
        "update": {
          "successfully": "Report %{name} was successfully updated."
        }
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": {
              "0": "<p>Are you sure you want to delete?</p> <p>All Campaigns, Sub-campaigns and users will also be deleted</p>",
              "1": "<p>Are you sure you want to delete?</p> <p>All Sub-campaigns and users will also be deleted</p>",
              "2": "<p>Are you sure you want to delete?</p> <p>All users will also be deleted</p>"
            },
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "disable": {
            "body": {
              "0": "<p>Are you sure you want to archive?</p> <p>All Campaigns, Sub-campaigns and users will also be archived</p>",
              "1": "<p>Are you sure you want to archive?</p> <p>All Sub-campaigns and users will also be archived</p>",
              "2": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>",
              "3": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>"
            },
            "title": "Archive <strong>%{name}</strong> ?"
          },
          "enable": {
            "body": {
              "0": "<p>Are you sure you want to unarchive?</p>",
              "1": "<p>Are you sure you want to unarchive?</p>",
              "2": "<p>Are you sure you want to unarchive?</p>",
              "3": "<p>Are you sure you want to unarchive?</p>"
            },
            "title": "Unarchive <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Client",
          "create_admin": "Create Client Admin",
          "delete": "Delete Client",
          "disable": "Disable Client",
          "edit": "Edit Client",
          "enable": "Enable Client"
        }
      },
      "sidebar": {
        "copy": "Copy Client",
        "design": "Edit Design",
        "destroy": "Delete Client",
        "disable": "Disable",
        "edit": "Edit Client",
        "enable": "Enable",
        "licenses": "Manage Licenses",
        "new": "New Client",
        "title": "Client's options"
      },
      "statistics": {
        "index": {
          "all_assessments": "All assessments",
          "assessment_type": "Assessment type",
          "title": "Statistics"
        }
      },
      "sub_campaigns": {
        "archive": {
          "successfully": "Sub-Campaign %{name} was successfully archived."
        },
        "copy": {
          "error": "Sub-Campaign %{name} was not copied.",
          "successfully": "Sub-Campaign %{name} was successfully copied."
        },
        "create": {
          "successfully": "Sub-Campaign %{name} was successfully created."
        },
        "destroy": {
          "successfully": "Sub-Campaign %{name} was successfully deleted."
        },
        "edit": {
          "header": "Edit Sub-Campaign"
        },
        "export": {
          "assigned_user": "Assigned Users",
          "completed_user": "Completed Users",
          "header": {
            "actions": "Actions",
            "actual_usage": "Actual Usage",
            "archive_status": "Archive Status",
            "name": "Name",
            "sub_campaign": "Sub-Campaigns",
            "tests_allocated": "Tests Allocated",
            "users": "Users"
          },
          "name": "Sub-Campaign Name"
        },
        "header": {
          "actions": "Actions"
        },
        "index": {
          "export": "Export",
          "new": "Add",
          "title": "Sub Campaigns"
        },
        "list": {
          "assigned_user": "Assigned Users",
          "completed_user": "Completed Users",
          "header": {
            "actions": "Actions",
            "actual_usage": "Actual Usage",
            "archive_status": "Archive Status",
            "name": "Name",
            "sub_campaign": "Sub-Campaigns",
            "tests_allocated": "Tests Allocated",
            "users": "Users"
          },
          "name": "Sub-Campaign Name"
        },
        "new": {
          "header": "New Sub-Campaign"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Sub Campaign",
            "create_report": "Add new Report",
            "create_user": "Add New User",
            "delete": "Delete Sub Campaign",
            "edit": "Edit Sub Campaign"
          }
        },
        "sidebar": {
          "archive": "Archive Sub-Campaign",
          "copy": "Copy Sub-Campaign",
          "destroy": "Delete Sub-Campaign",
          "disable": "Disable",
          "edit": "Edit Sub-Campaign",
          "enable": "Enable",
          "new": "New Sub-Campaign",
          "title": "Sub-Campaign's options"
        },
        "toggle_status": {
          "successfully": "Sub-Campaign %{name} was successfully updated."
        },
        "update": {
          "successfully": "Sub-Campaign %{name} was successfully updated."
        }
      },
      "toggle_status": {
        "successfully": "Client Tenancy %{name} was successfully updated."
      },
      "tooltips": {
        "copy": "Copy Campaign",
        "create_report": "Add New Report",
        "create_user": "Add New User",
        "delete": "Delete Campaign",
        "edit": "Edit Campaign",
        "export": "Export"
      },
      "update": {
        "successfully": "Client Tenancy %{name} was successfully updated."
      },
      "url": "Url",
      "users": {
        "admins": {
          "breadcrumb": "Admin Users",
          "title": "Admins"
        },
        "assigns": {
          "common": {
            "detach_assessment": "Assessment %{name} was successfully detached.",
            "detach_report": "Report %{name} was successfully detached."
          },
          "create": {
            "successfully": "Successfully Updated"
          },
          "form": {
            "assessment": "Assessment",
            "multiple_report_message": "The report has data from multiple assessments. To provide an access to the user to download the results you should assign all assessments linked to the report.",
            "user_access": {
              "access": "Reports access",
              "preserve_user_access": "Apply access settings only for the newly added report",
              "user": "User"
            }
          },
          "index": {
            "add_assessments": "Add Assessments",
            "add_reports": "Add Reports",
            "title": "%{name} - Assessments and Reporting"
          },
          "list": {
            "actions": "Actions",
            "assessment_name": "Assessment Name",
            "assessment_type": "Assessment Type",
            "completed_at": "Completed at",
            "reports": "Reports",
            "status": "Status",
            "uniq_id": "Uniq ID"
          },
          "new": {
            "header": "Assign Assessment and Reports"
          },
          "reset": {
            "successfully": "Result data was successfully reseted"
          },
          "resource": {
            "confirms": {
              "assigns_report": {
                "add_user_access": {
                  "body": "<p>Are you sure you want to add user access to this report?</p>",
                  "title": "Add user access to <strong>%{name}</strong> ?"
                },
                "delete": {
                  "body": "<p>Are you sure you want to detach this report?</p>",
                  "title": "Detach <strong>%{name}</strong> ?"
                },
                "regenerate": {
                  "body": "<p>Are you sure you want to regenerate this report?</p>",
                  "title": "Regenerate <strong>%{name}</strong> ?"
                },
                "remove_user_access": {
                  "body": "<p>Are you sure you want to remove user access to this report?</p>",
                  "title": "Remove user access to <strong>%{name}</strong> ?"
                }
              },
              "reset": {
                "body": "<p>Are you sure you want to reset result?</p>",
                "title": "Reset <strong>Result</strong> ?"
              }
            },
            "generating": "Report \"%{name}\" is generating",
            "no_access_to_reports": "No access to reports",
            "no_reports": "No relative reports",
            "not_completed": "Not completed",
            "tooltips": {
              "assigns_report": {
                "add_user_access": "Add user access",
                "delete": "Detach Report",
                "regenerate": "Regenerate report file",
                "remove_user_access": "Remove user access"
              },
              "delete": "Detach Assessment",
              "reset": "Reset result"
            }
          }
        },
        "assigns_reports": {
          "edit": {
            "header": "Add Reports"
          },
          "form": {
            "assessment": "Assessment",
            "detach": "Detach",
            "multiple_report_message": "The report has data from multiple assessments. To provide an access to the user to download the results you should assign all assessments linked to the report.",
            "user_access": {
              "access": "Reports access",
              "user": "User"
            }
          },
          "new": {
            "header": "Add Reports"
          },
          "regenerate": {
            "successfully": "Successfully sent to regenerate"
          },
          "update": {
            "successfully": "Successfully Updated"
          }
        },
        "create": {
          "successfully": "User %{name} was successfully created."
        },
        "destroy": {
          "successfully": "User %{name} was successfully deleted."
        },
        "edit": {
          "add": "Add",
          "grants": "Privileges",
          "hris_data": "HRIS Data",
          "key": "Key",
          "personal_data": "Personal Data",
          "remove": "Remove",
          "title": "Edit user",
          "value": "Value"
        },
        "form": {
          "choose": " - Choose - "
        },
        "form_admin": {
          "choose_admin": "Choose Admin",
          "create_admin": "Create Admin"
        },
        "index": {
          "breadcrumb": "Users",
          "export": "Export",
          "export_completion_status": "Completion Status",
          "export_users": "Users",
          "filterrific": {
            "with_role": {
              "administration": "Administrators",
              "all": "All",
              "users": "Users"
            }
          },
          "import": "Import",
          "import_hris": "HRIS Data",
          "import_users": "Users",
          "new": "Add",
          "new_superadmin": "Add SuperAdmin",
          "title": "Users",
          "tooltips": {
            "create": "Create",
            "export": "Export",
            "import": "Import"
          }
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New user"
        },
        "reports": {
          "copy": {
            "error": "Report #%{id} was not copied."
          },
          "create": {
            "successfully": "Report %{name} was successfully created."
          },
          "destroy": {
            "successfully": "Report %{name} was successfully deleted."
          },
          "edit": {
            "header": "Edit Report Name"
          },
          "form": {
            "load_mindmill_report": "Load from Mindmill",
            "none_external": "None - Use report builder",
            "select_family": "Select Report Bundle",
            "types": {
              "common": "Any",
              "eti": "ETI",
              "yti": "YTI"
            }
          },
          "index": {
            "add": "Add",
            "bulk_download": "Bulk Download",
            "families": "Report Bundles",
            "filterrific": {
              "with_assessment_category": {
                "360": "360 Feedback",
                "all": "All",
                "case_study": "Case Studies",
                "organisational": "Org Surveys",
                "psychometric": "Psychometrics"
              }
            },
            "owner": "Owner",
            "regenerate": "Regenerate Reports",
            "report_family": "Report Bundle",
            "title": "Reports",
            "tooltips": {
              "create": "Create"
            }
          },
          "list": {
            "created_at": "Created Date",
            "updated_at": "Modified Date"
          },
          "new": {
            "header": "Select Report"
          },
          "preview": {
            "export_pdf": "Export to PDF",
            "title": "Preview"
          },
          "regenerate": {
            "successfully": "Report successfully sent for regeneration"
          },
          "resource": {
            "confirmations": {
              "delete": {
                "body": "<p>Are you sure you want to delete this Report?</p>\n",
                "title": "Delete <strong>Report</strong> ?"
              },
              "detach": {
                "body": "<p>Are you sure you want to detach this Report?</p>\n",
                "title": "Detach <strong>Report</strong> ?"
              },
              "regenerate": {
                "body": "<p>Are you sure you want to regenerate this Report for all Users?</p>",
                "title": "Regenerate <strong>%{name}</strong>?"
              },
              "toggle_status": {
                "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
                "title": "<strong>%{status}</strong> %{name}?"
              }
            },
            "tooltips": {
              "copy": "Copy Report",
              "delete": "Delete Report",
              "edit": "Edit Report",
              "preview": "Preview Report"
            }
          },
          "sidebar": {
            "copy": "Copy Report",
            "destroy": "Delete Report",
            "edit": "Edit Report",
            "regenerate": "Regenerate Report",
            "title": "Report's options",
            "view": "View Report"
          },
          "toggle_status": {
            "successfully": "Report was successfully updated."
          },
          "types": {
            "common": "Any",
            "eti": "ETI",
            "yti": "YTI"
          },
          "update": {
            "successfully": "Report %{name} was successfully updated."
          }
        },
        "reset_password": {
          "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
        },
        "resource": {
          "confirmations": {
            "change_password": {
              "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
              "title": "Change password <strong>%{name}</strong> ?"
            },
            "delete": {
              "body": "<p>Are you sure you want to delete this User?</p>\n",
              "title": "Delete <strong>%{name}</strong> ?"
            },
            "membership": {
              "delete": {
                "body": "<p>Are you sure you want to delete?</p>\n",
                "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
              }
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this User?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "change_password": "Change Password",
            "chart": "View user report",
            "delete": "Delete User",
            "edit": "Edit User",
            "mail": "Send Mail",
            "sign_in": "Login as user"
          }
        },
        "sidebar": {
          "api_keys": "API keys",
          "assessments_and_reports": "Assessments and Reporting",
          "destroy": "Delete User",
          "disable": "Disable",
          "edit_user": "Edit User",
          "email": "Send Mail",
          "enable": "Enable",
          "export_users": "Export users",
          "import_users": "Import users",
          "login_as_user": "Login as User",
          "new_user": "New User",
          "reset_password": "Change Password",
          "title": "User's options"
        },
        "spoof": {
          "successfully": "You was successfully login as %{name}"
        },
        "toggle_status": {
          "successfully": "User %{name} was successfully updated."
        },
        "update": {
          "successfully": "User %{name} was successfully updated."
        }
      }
    },
    "clients_hierarchy": "Project > Campaign > Sub Campaign",
    "close": "Close",
    "communications": {
      "copy": {
        "error": "Communication #%{id} was not copied."
      },
      "create": {
        "successfully": "Communication created successfully."
      },
      "destroy": {
        "successfully": "Communication %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Communication"
      },
      "form": {
        "body_mustache": "{{{user_link}}} - Link to the Platform for existing users or a one time only link to set a password for new users\n{{first_name}} - Recipient First Name\n{{last_name}} - Recipient Last Name\n{{email}} - Recipient Email\n",
        "delivery_at": "Delivery at (GST)",
        "delivery_rules": {
          "in_progress": "If assessment is in progress",
          "not_competed": "If assessment is not completed",
          "not_started": "If assessment is not started",
          "send_now": "Send now",
          "specific_datetime": "Send at"
        },
        "kind": "Communication Types",
        "selected_cc_recipients": "Selected CC Recipients",
        "selected_recipients": "Selected Recipients",
        "stop_reminder": "Stop sending reminders",
        "stop_reminder_datetime": "End date for reminders (GST)"
      },
      "index": {
        "clients": "Clients",
        "completion": "Completion",
        "invitation": "Invitation",
        "new": "Add",
        "other": "Other",
        "owner": "Owner",
        "reminder": "Reminder",
        "title": "Communication Center",
        "tooltips": {
          "create": "Create"
        },
        "type": "Type"
      },
      "list": {
        "actions": "Actions",
        "author": "Created by",
        "campaign": "Campaign",
        "client_name": "Client",
        "created_at": "Created Date",
        "creator_first_name": "Created by",
        "delivery_rule": "Delivery",
        "kind": "Communication type",
        "project": "Project",
        "recipients": "Recipients",
        "sub_campaign": "Sub-campaign",
        "subject": "Communication subject",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New Communication"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Communication?</p>\n",
            "title": "Delete <strong>Communication</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Communication?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Communication",
          "delete": "Delete Communication",
          "download": "Download Communication History",
          "edit": "Edit Communication",
          "view": "View Communication"
        }
      },
      "show": {
        "assessment": "Assessment:",
        "back": "Back",
        "body": "Body:",
        "campaign": "Campaign:",
        "client": "Client:",
        "communication_type": "Communication type:",
        "delivery_interval": "Delivery interval:",
        "delivery_rule": "Delivery rule:",
        "every_interval": "Every %{interval}",
        "owner": "Owner:",
        "project": "Project:",
        "recipients": "Recipients:",
        "specific_datetime": "Send at:",
        "stop_reminder_datetime": "End date for reminders (GST)",
        "sub_campaign": "Sub Campaign:",
        "subject": "Subject:",
        "users": "Users:"
      },
      "sidebar": {
        "copy": "Copy Communication",
        "destroy": "Delete Communication",
        "download": "Download Communication History",
        "edit": "Edit Communication",
        "new": "New Communication",
        "title": "Communication's options",
        "view": "View Communication"
      },
      "toggle_status": {
        "successfully": "Communication was successfully updated."
      }
    },
    "copy": "Copy",
    "create": "Create",
    "created": "Successfully created",
    "created_by": "Created By",
    "dimensions": {
      "copy": {
        "error": "Dimension #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Dimension %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Dimension Name"
      },
      "index": {
        "new": "Add",
        "owner": "Owner",
        "title": "Dimensions",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New Dimension"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Dimension?</p>\n",
            "title": "Delete <strong>Dimension</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Dimension?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Dimension",
          "delete": "Delete Dimension",
          "edit": "Edit Dimension Name"
        }
      },
      "sidebar": {
        "assign": "Assign Dimension",
        "copy": "Copy Dimension",
        "destroy": "Delete Dimension",
        "disable": "Disable Dimension",
        "edit": "Edit Dimension Name",
        "enable": "Enable Dimension",
        "new": "New Dimension",
        "title": "Dimension's options",
        "view": "View Dimension"
      },
      "toggle_status": {
        "successfully": "Dimension was successfully updated."
      }
    },
    "disable": "Disable",
    "edit": "Edit",
    "enable": "Enable",
    "factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Factor Name"
      },
      "form": {
        "no_icon": "No Logo yet"
      },
      "index": {
        "icon": "Icon",
        "new": "Add",
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Factor?</p>\n",
            "title": "Delete <strong>Factor</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Factor?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Factor",
          "delete": "Delete Factor",
          "edit": "Edit Factor"
        }
      },
      "sidebar": {
        "copy": "Copy Factor",
        "destroy": "Delete Factor",
        "edit": "Edit Factor",
        "title": "Factor's options",
        "view": "View Factor"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "genders": {
      "female": "Female",
      "male": "Male",
      "not_set": "Not set"
    },
    "hide": "Hide",
    "home": {
      "index": {
        "notifications": "Notifications"
      }
    },
    "import": "Import",
    "imports": {
      "assessments": {
        "results": {
          "existing_users_whose_password_not_changed_modal_dialog": {
            "header": "The list of users whose passwords will be not changed"
          },
          "form": {
            "description": "Refer to the Export functionality to extract a template that can be used to Import here.",
            "import": "Import"
          }
        }
      },
      "base": {
        "form": {
          "import": "Import"
        }
      },
      "errors": {
        "error": "[Row %{row}] %{error}",
        "invalid_assign": "Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
        "invalid_format": "There is no Email column",
        "norm": {
          "factor_is_not_described": "[#%{coords}] factor %{factor} is not described above",
          "factors_mismatch": "[#%{coords}] dimension %{dimension} does not have factor %{factor}",
          "not_set_dimension": "The name of the Dimension should be written in A-1",
          "sub_factors_mismatch": "[#%{coords}] dimension %{dimension} does not have sub factor %{factor}"
        },
        "result": {
          "error": "[Row %{row}] %{error}",
          "invalid_assign": "[Row %{row}] Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
          "invalid_format": "Invalid File format"
        },
        "translation": {
          "error": "[Translation %{id}] %{error}",
          "invalid_format": "Invalid File format"
        },
        "unknown_type": "Unknown file type: %{filename}",
        "user": {
          "not_found": "[Row %{row}] Couldn't find User with Email Address %{email}"
        }
      },
      "form": {
        "description": "Refer to the Export functionality to extract a template that can be used to Import here.",
        "import": "Import"
      },
      "hris": {
        "existing_users_whose_password_not_changed_modal_dialog": {
          "header": "The list of users whose passwords will be not changed"
        },
        "form": {
          "description": "Refer to the Export functionality to extract a template that can be used to Import here.",
          "import": "Import"
        }
      },
      "new": {
        "header": "Import"
      },
      "users": {
        "existing_users_whose_password_not_changed_modal_dialog": {
          "header": "The list of users whose passwords will be not changed"
        },
        "form": {
          "description": "Refer to the Export functionality to extract a template that can be used to Import here.",
          "import": "Import"
        }
      }
    },
    "imports_assessments_result_imports": {
      "create": {
        "successfully": "Raw Results data was successfully imported"
      },
      "modal": {
        "header": {
          "raw": "Import Raw Results data",
          "scoring": "Import Scoring Results data"
        }
      }
    },
    "imports_hris_imports": {
      "create": {
        "successfully": "HRIS data was successfully imported"
      },
      "new": {
        "header": "Import HRIS data"
      }
    },
    "imports_user_imports": {
      "create": {
        "successfully": "Users was successfully imported"
      },
      "new": {
        "header": "Import Users"
      }
    },
    "libraries": {
      "create": {
        "successfully": "Item %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Item %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit"
      },
      "index": {
        "new_folder": "New Folder",
        "owner": "Owner",
        "title": "Media Library",
        "upload": "Upload"
      },
      "list": {
        "created_at": "Created Date",
        "new_folder": "New folder",
        "root": "Media Library",
        "updated_at": "Modified Date",
        "upload": "Upload new file"
      },
      "new": {
        "header": "New Report"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete %{name}?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete",
          "edit": "Edit"
        }
      },
      "update": {
        "successfully": "Item %{name} was successfully updated."
      }
    },
    "memberships": {
      "admin": {
        "new": {
          "header": "New admin"
        }
      },
      "admin_chosen": {
        "successfully": "Admin users was successfully updated."
      },
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully deleted."
      },
      "edit": {
        "add": "Add",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "index": {
        "export": "Export",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "new": "Add",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    },
    "meta_title": "Administration panel",
    "modified_by": "Modified By",
    "navigation": {
      "admins": "Admins",
      "assessments": "Assessments",
      "campaign_templates": "Campaign Templates",
      "campaigns": "Campaigns",
      "client": "Client Tenancy",
      "client_admins": "Client Admins",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "datasheets": "Datasheets",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "licenses": "Licenses",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "products": "Products",
      "project_admins": "Project Admins",
      "projects": "Projects",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "report_families": "Report Bundles",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_campaigns": "Sub Campaigns",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "new": "New",
    "no_data_found": "No data found",
    "norms": {
      "copy": {
        "error": "Norm #%{id} was not copied."
      },
      "create": {
        "successfully": "Norm %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Norm %{name} was successfully deleted."
      },
      "edit": {
        "header": "Rename Norm"
      },
      "editor": {
        "factors": "Factors",
        "inplace_title": "Enter value",
        "sub_factors": "Sub Factors",
        "title": "Norm Editor",
        "tooltips": {
          "edit": "Edit Title"
        }
      },
      "index": {
        "export": "Export",
        "import": "Import",
        "new": "Add",
        "owner": "Owner",
        "title": "Norms"
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New norm"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Norm?</p>\n",
            "title": "Delete <strong>Norm</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Norm?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Norm",
          "delete": "Delete Norm",
          "edit": "Rename Norm"
        }
      },
      "sidebar": {
        "assign": "Assign Norm",
        "copy": "Copy Norm",
        "destroy": "Delete Norm",
        "disable": "Disable",
        "edit": "Rename Norm",
        "editor": "Norm Editor",
        "enable": "Enable",
        "export": "Export Norm",
        "import": "Import Norm",
        "new": "New Norm",
        "surveys": "Linked Surveys",
        "title": "Norm's options",
        "view": "View Norm"
      },
      "toggle_status": {
        "successfully": "Norm was successfully updated."
      },
      "update": {
        "successfully": "Norm %{name} was successfully updated."
      }
    },
    "noty": {
      "error_408": "This action takes too long. Please try to reload the page.",
      "error_500": "Something went wrong. Contact your administrator."
    },
    "occupations": {
      "copy": {
        "error": "Occupation #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Occupation #%{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit occupation"
      },
      "form": {
        "hint": {
          "key_career_tracks": "\"+\" - list, \"*\" - bold. Example: + *Biology* - some description..."
        }
      },
      "index": {
        "new": "Add",
        "title": "Occupations",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New occupation"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this occupation?</p>\n",
            "title": "Delete <strong>Occupation</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Occupation",
          "delete": "Delete Occupation",
          "edit": "Edit Occupation"
        }
      },
      "sidebar": {
        "copy": "Copy Occupation",
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "New Occupation",
        "title": "Occupation's options"
      },
      "toggle_status": {
        "successfully": "Occupation was successfully updated."
      }
    },
    "occupations_factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor #%{name} was successfully detached."
      },
      "edit": {
        "header": "Edit Factor"
      },
      "index": {
        "new": "Add",
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "Attach Factors"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this factor?</p>",
            "title": "Delete <strong>Factor</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete Factor",
          "edit": "Edit Factor"
        }
      },
      "sidebar": {
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "Attach Factor",
        "title": "Factor's options"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "products": {
      "copy": {
        "error": "Product",
        "successfully": "Product %{name} was successfully copied."
      },
      "create": {
        "successfully": "Product %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Product %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Product"
      },
      "form": {
        "add_image": "Add Image",
        "images": "Images",
        "prices": "Prices",
        "reports": "Reports"
      },
      "image_fields": {
        "remove": "Remove Image"
      },
      "index": {
        "new": "Add",
        "title": "Products list"
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New Product"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Product?</p>\n",
            "title": "Delete <strong>Product</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Product?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Product",
          "delete": "Delete Product",
          "edit": "Edit Product"
        }
      },
      "sidebar": {
        "copy": "Copy Product",
        "destroy": "Destroy Product",
        "disable": "Disable",
        "edit": "Edit Product",
        "enable": "Enable",
        "new": "New Product",
        "title": "Product's options"
      },
      "update": {
        "successfully": "Product %{name} was successfully updated."
      }
    },
    "profiles": {
      "edit": {
        "success": "Profile was successfully updated.",
        "title": "Profile Editor"
      }
    },
    "psychometrics": "Psychometrics",
    "questions": {
      "destroy": {
        "successfully": "Question %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Question"
      },
      "index": {
        "owner": "Owner"
      },
      "new": {
        "header": "New Question"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Question?</p>\n",
            "title": "Delete <strong>Question</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Question?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "report_families": {
      "copy": {
        "error": "Report Bundle #%{id} was not copied."
      },
      "create": {
        "successfully": "Report Bundle %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Report Bundle %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Report Bundle Name"
      },
      "index": {
        "add": "Add",
        "families": "Families",
        "title": "Report Bundles",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New Report Bundle"
      },
      "reports": {
        "index": {
          "add": "Add new Report",
          "title": "Reports in the Bundle",
          "tooltips": {
            "create": "Create"
          }
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Report from Bundle?</p>\n",
              "title": "Delete <strong>Report</strong> from Bundle?"
            }
          },
          "tooltips": {
            "delete": "Delete Report from Bundle"
          }
        }
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Report Bundle?</p>\n",
            "title": "Delete <strong>Report</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Report Bundle?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Report Bundle",
          "delete": "Delete Report Bundle",
          "edit": "Edit Report Bundle",
          "preview": "Preview Report Bundle"
        }
      },
      "sidebar": {
        "copy": "Copy Report Bundle",
        "destroy": "Delete Report Bundle",
        "edit": "Edit Report Bundle",
        "title": "Report Bundle's options",
        "view": "View Report Bundle"
      },
      "update": {
        "successfully": "Report Bundle %{name} was successfully updated."
      }
    },
    "reports": {
      "copy": {
        "error": "Report #%{id} was not copied."
      },
      "create": {
        "successfully": "Report %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Report %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Report Name"
      },
      "form": {
        "load_mindmill_report": "Load from Mindmill",
        "none_external": "None - Use report builder",
        "select_family": "Select Report Bundle",
        "types": {
          "common": "Any",
          "eti": "ETI",
          "yti": "YTI"
        }
      },
      "index": {
        "add": "Add",
        "bulk_download": "Bulk Download",
        "families": "Report Bundles",
        "filterrific": {
          "with_assessment_category": {
            "360": "360 Feedback",
            "all": "All",
            "case_study": "Case Studies",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "owner": "Owner",
        "regenerate": "Regenerate Reports",
        "report_family": "Report Bundle",
        "title": "Reports",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "Select Report"
      },
      "preview": {
        "export_pdf": "Export to PDF",
        "title": "Preview"
      },
      "regenerate": {
        "successfully": "Report successfully sent for regeneration"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Report?</p>\n",
            "title": "Delete <strong>Report</strong> ?"
          },
          "detach": {
            "body": "<p>Are you sure you want to detach this Report?</p>\n",
            "title": "Detach <strong>Report</strong> ?"
          },
          "regenerate": {
            "body": "<p>Are you sure you want to regenerate this Report for all Users?</p>",
            "title": "Regenerate <strong>%{name}</strong>?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Report",
          "delete": "Delete Report",
          "edit": "Edit Report",
          "preview": "Preview Report"
        }
      },
      "sidebar": {
        "copy": "Copy Report",
        "destroy": "Delete Report",
        "edit": "Edit Report",
        "regenerate": "Regenerate Report",
        "title": "Report's options",
        "view": "View Report"
      },
      "toggle_status": {
        "successfully": "Report was successfully updated."
      },
      "types": {
        "common": "Any",
        "eti": "ETI",
        "yti": "YTI"
      },
      "update": {
        "successfully": "Report %{name} was successfully updated."
      }
    },
    "save": "Save",
    "search": "Search",
    "show": "Show",
    "sub_factors": {
      "copy": {
        "error": "Sub-Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Sub-Factor %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Sub-Factor Name"
      },
      "index": {
        "new": "Add",
        "title": "Sub-Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Sub-Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Sub-Factor?</p>\n",
            "title": "Delete <strong>Sub-Factor</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Sub-Factor",
          "delete": "Delete Sub-Factor",
          "edit": "Edit Sub-Factor Name"
        }
      },
      "sidebar": {
        "destroy": "Delete Sub-Factor",
        "edit": "Edit Sub-Factor",
        "title": "Sub-Factor's options"
      },
      "toggle_status": {
        "successfully": "Sub-Factor was successfully updated."
      }
    },
    "templates": {
      "blocks": {
        "copy": {
          "error": "Block"
        },
        "destroy": {
          "successfully": "Block %{name} was successfully deleted."
        },
        "edit": {
          "header": "Edit Block"
        },
        "index": {
          "new": "Add",
          "templates": {
          },
          "title": "Blocks",
          "tooltips": {
            "create": "Create"
          }
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New Block"
        },
        "new_assign": {
          "header": "Assign Block to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Block",
            "delete": "Delete Block",
            "edit": "Edit Block"
          }
        },
        "sidebar": {
          "destroy": "Delete Block",
          "disable": "Disable",
          "edit": "Edit Block",
          "enable": "Enable",
          "new": "New Block",
          "new_assign": "Assign Block",
          "title": "Block's options"
        }
      },
      "questions": {
        "copy": {
          "error": "Question"
        },
        "destroy": {
          "successfully": "Question %{name} was successfully deleted."
        },
        "edit": {
          "header": "Edit Question"
        },
        "index": {
          "new": "Add",
          "templates": {
            "blocks": "Blocks",
            "questions": "Questions"
          },
          "title": "Questions",
          "tooltips": {
            "create": "Create"
          }
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New Question"
        },
        "new_assign": {
          "header": "Assign Question to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Question",
            "delete": "Delete Question",
            "edit": "Edit Question"
          }
        },
        "sidebar": {
          "destroy": "Delete Question",
          "disable": "Disable",
          "edit": "Edit Question",
          "enable": "Enable",
          "new": "New Question",
          "new_assign": "Assign Question",
          "title": "Question's options"
        }
      }
    },
    "tenancies": "Tenancies",
    "threesixty_campaigns": {
      "email_templates": {
        "approve_nomination": {
          "description": "This message is sent to a manager when a nomination, made by a direct report, needs to be approved",
          "name": "Approve Nomination"
        },
        "approve_report": {
          "description": "This message is sent to a subject's manager to notify them that the subjects report is ready for approval",
          "name": "Approve Report"
        },
        "categories": {
          "approvals": "Approvals",
          "invitations": "Invitations",
          "reminders": "Reminders",
          "report_ready": "Report Ready"
        },
        "custom_message": {
          "description": "This message can be sent to anyone participating in the assessment",
          "name": "Custom Message"
        },
        "days_repeated": "days, repeated",
        "evaluator_invite": {
          "description": "This message will be sent to all participants that are evaluators",
          "name": "Evaluator Invite"
        },
        "evaluator_reminder": {
          "description": "This message will be sent to remind evaluators to complete pending evaluations",
          "name": "Evaluator Reminder",
          "rule_description": "Specify rules for automatically scheduling when an invitation is scheduled",
          "rule_name": "Evaluator Reminder Rules"
        },
        "from": "From",
        "manager_report_ready": {
          "description": "This message is sent to a subject's manager once the subject's report is ready",
          "name": "Manager Report Ready"
        },
        "nomination_denied": {
          "description": "This message is sent to subjects when a nomination is denied",
          "name": "Nomination Denied"
        },
        "reply_to_email": "Reply to email",
        "request_approval": {
          "description": "This message is sent to managers when a subject requests approval",
          "name": "Request Approval"
        },
        "schedule_email": "Schedule Email",
        "send_test_email": "Send Test Email",
        "subject": "Subject",
        "subject_invite": {
          "description": "This message will be sent to invite subjects to participate in the assessment",
          "name": "Subject Invite"
        },
        "subject_reminder": {
          "description": "Message sent to each participant to remind them to participate in the assessment",
          "name": "Subject Reminder",
          "rule_description": "Specify rules for automatically scheduling when an invitation is scheduled",
          "rule_name": "Subject Reminder Rules"
        },
        "subject_report_ready": {
          "description": "This message is sent to a subject once their report is ready",
          "name": "Subject Report Ready"
        },
        "times": "times"
      },
      "instruction_templates": {
        "evaluate_others": {
          "description": "This message will be displayed when participants are evaluating others from inside the portal",
          "name": "Evaluate Others"
        },
        "evaluate_self": {
          "description": "This message will be displayed to subjects when they begin their self-evaluation",
          "name": "Evaluator Self"
        },
        "evaluator_welcome": {
          "description": "This message will override the \"Welcome Message\" and be displayed to participants who are currently participating as evaluators only.",
          "name": "Evaluator welcome"
        },
        "invite_evaluators": {
          "description": "This message will be displayed to subjects when they begin nominating evaluators",
          "name": "Invite Evaluators"
        },
        "welcome_message": {
          "description": "This message will be displayed to subjects when they log in to begin the assessment or view their task list",
          "name": "Welcome Message"
        }
      }
    },
    "translations": {
      "assessments": {
        "new": {
          "header": "Import Translations"
        }
      },
      "import": {
        "successfully": "Translations was successfully imported"
      }
    },
    "tte": "TTE",
    "uniq_id": "Uniq ID",
    "update": "Update",
    "updated": "Successfully updated",
    "users": {
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully deleted."
      },
      "edit": {
        "add": "Add",
        "grants": "Privileges",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "form": {
        "choose": " - Choose - "
      },
      "index": {
        "breadcrumb": "Users",
        "export": "Export",
        "export_completion_status": "Completion Status",
        "export_users": "Users",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "new": "Add",
        "new_superadmin": "Add SuperAdmin",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "resource": {
        "confirmations": {
          "change_password": {
            "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
            "title": "Change password <strong>%{name}</strong> ?"
          },
          "delete": {
            "body": "<p>Are you sure you want to delete this User?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "membership": {
            "delete": {
              "body": "<p>Are you sure you want to delete?</p>\n",
              "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
            }
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this User?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "change_password": "Change Password",
          "chart": "View user report",
          "delete": "Delete User",
          "edit": "Edit User",
          "mail": "Send Mail",
          "sign_in": "Login as user"
        }
      },
      "sidebar": {
        "api_keys": "API keys",
        "assessments_and_reports": "Assessments and Reporting",
        "destroy": "Delete User",
        "disable": "Disable",
        "edit_user": "Edit User",
        "email": "Send Mail",
        "enable": "Enable",
        "export_users": "Export users",
        "import_users": "Import users",
        "login_as_user": "Login as User",
        "new_user": "New User",
        "reset_password": "Change Password",
        "title": "User's options"
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    }
  },
  "assessments": {
    "decorator": {
      "no_description": "Description is empty"
    },
    "index": {
      "managers_assessments_button": "Action Planning",
      "managers_dashboard_button": "Managers Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "resource": {
      "assigned": "Assigned %{date}",
      "invite_users": "Invite Users",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "results": "Results",
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start"
      }
    }
  },
  "assigns": {
    "assign": {
      "accept_privacy_modal": {
        "accept": "Accept",
        "reject": "Reject",
        "text": "In completing this questionnaire(s), you are consenting for any data collected as a result to be used for the purposes intended and described in the communication you have already received. Your responses to the questions asked, along with any other associated data provided, will be used for the purposes of analysing and reporting your individual responses. We may also use your responses as part of large scale research projects. Your data will be treated with the requisite sensitivity and security. Please click <a href='https://thetalententerprise.com/privacy-statement/' target='_blank'>here</a> / go to this website to find out more or to contact someone for any more specific queries you may have.",
        "title": "Data processing consent"
      },
      "assigned": "Assigned %{date}",
      "mindmill_confirmation": "Starting this assessment you will lost results \"%{assessment}\". Click \"Cancel\" if you want leave results, and click \"Ok\" if you want continue",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start",
        "overdue": "Overdue"
      }
    },
    "assigns_reports": {
      "download": "Download",
      "duration": "Duration",
      "progress": "Progress",
      "summary_report": "Summary report"
    },
    "decorator": {
      "completed": "Completed %{date}",
      "no_description": "Description is empty",
      "not_completed": "Not Completed"
    },
    "index": {
      "managers_dashboard_button": "Managers Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "multiple_report": {
      "results": "Results"
    },
    "notifications": {
      "completed": "%{user_name} finished assessment \"%{assessment_name}\"",
      "in_progress": "%{user_name} started to take assessment \"%{assessment_name}\""
    },
    "project_assessment": {
      "accept_privacy_modal": {
        "accept": "Accept",
        "reject": "Reject",
        "text": "In completing this questionnaire(s), you are consenting for any data collected as a result to be used for the purposes intended and described in the communication you have already received. Your responses to the questions asked, along with any other associated data provided, will be used for the purposes of analysing and reporting your individual responses. We may also use your responses as part of large scale research projects. Your data will be treated with the requisite sensitivity and security. Please click <a href='https://thetalententerprise.com/privacy-statement/' target='_blank'>here</a> / go to this website to find out more or to contact someone for any more specific queries you may have.",
        "title": "Data processing consent"
      },
      "assigned": "Assigned %{date}",
      "mindmill_confirmation": "Starting this assessment you will lost results \"%{assessment}\". Click \"Cancel\" if you want leave results, and click \"Ok\" if you want continue",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start",
        "overdue": "Overdue"
      }
    },
    "reports": {
      "load_results": "Load Results: %{report}",
      "processing": "Processing...",
      "results": "Results"
    }
  },
  "ckeditor": {
    "buttons": {
      "cancel": "Cancel",
      "delete": "Delete",
      "next": "Next",
      "upload": "Upload"
    },
    "confirm_delete": "Delete file?",
    "page_title": "CKEditor Files Manager"
  },
  "clear_filter": "Clear Filter",
  "confirmation": {
    "default_body": "Are you sure?",
    "default_title": "Confirmation"
  },
  "currencies": {
    "AED": "AED",
    "BHD": "BHD",
    "BYN": "BYN",
    "EUR": "EUR",
    "GBP": "GBP",
    "INR": "INR",
    "KWD": "KWD",
    "OMR": "OMR",
    "QAR": "QAR",
    "SAR": "SAR",
    "USD": "USD"
  },
  "date": {
    "abbr_day_names": [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "abbr_month_names": [
      null,
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    "day_names": [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "formats": {
      "default": "%Y-%m-%d",
      "long": "%B %d, %Y",
      "short": "%b %d"
    },
    "month_names": [
      null,
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    "order": [
      "year",
      "month",
      "day"
    ]
  },
  "datetime": {
    "distance_in_words": {
      "about_x_hours": {
        "one": "about 1 hour",
        "other": "about %{count} hours"
      },
      "about_x_months": {
        "one": "about 1 month",
        "other": "about %{count} months"
      },
      "about_x_years": {
        "one": "about 1 year",
        "other": "about %{count} years"
      },
      "almost_x_years": {
        "one": "almost 1 year",
        "other": "almost %{count} years"
      },
      "half_a_minute": "half a minute",
      "less_than_x_minutes": {
        "one": "less than a minute",
        "other": "less than %{count} minutes"
      },
      "less_than_x_seconds": {
        "one": "less than 1 second",
        "other": "less than %{count} seconds"
      },
      "over_x_years": {
        "one": "over 1 year",
        "other": "over %{count} years"
      },
      "x_days": {
        "one": "1 day",
        "other": "%{count} days"
      },
      "x_minutes": {
        "one": "1 minute",
        "other": "%{count} minutes"
      },
      "x_months": {
        "one": "1 month",
        "other": "%{count} months"
      },
      "x_seconds": {
        "one": "1 second",
        "other": "%{count} seconds"
      }
    },
    "prompts": {
      "day": "Day",
      "hour": "Hour",
      "minute": "Minute",
      "month": "Month",
      "second": "Seconds",
      "year": "Year"
    }
  },
  "devise": {
    "administrators": {
      "meta_title": "Login to administration panel",
      "passwords": {
        "edit": {
          "submit": "Set new password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "submit": "Send me instructions",
          "title": "Forgot your password?"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": "Contact Us",
          "privacy": "Privacy"
        }
      }
    },
    "confirmations": {
      "confirmed": "Your email address has been successfully confirmed.",
      "new": {
        "resend_confirmation_instructions": "Resend confirmation instructions"
      },
      "send_instructions": "You will receive an email with instructions for how to confirm your email address in a few minutes.",
      "send_paranoid_instructions": "If your email address exists in our database, you will receive an email with instructions for how to confirm your email address in a few minutes."
    },
    "failure": {
      "already_authenticated": "You are already signed in.",
      "inactive": "Your account is not activated yet.",
      "invalid": "Invalid %{authentication_keys} or password.",
      "invited": "You have a pending invitation, accept it to finish creating your account.",
      "last_attempt": "You have one more attempt before your account is locked.",
      "locked": "Your account is locked.",
      "not_found_in_database": "Invalid %{authentication_keys} or password.",
      "timeout": "Your session expired. Please login again to continue.",
      "unauthenticated": "You need to login or register before continuing.",
      "unconfirmed": "You have to confirm your email address before continuing."
    },
    "invitations": {
      "edit": {
        "confirm_password_label": "Confirm Password",
        "description": "To create a new password, please enter your new password in the boxes below.",
        "header": "Set your password",
        "password_label": "Password",
        "submit": "Set New Password",
        "submit_button": "Set my password",
        "title": "Create password"
      },
      "invitation_removed": "Your invitation was removed.",
      "invitation_token_invalid": "The invitation token provided is not valid!",
      "new": {
        "header": "Send invitation",
        "submit_button": "Send an invitation"
      },
      "no_invitations_remaining": "No invitations remaining",
      "send_instructions": "An invitation email has been sent to %{email}.",
      "updated": "Your password was set successfully. You are now signed in.",
      "updated_not_active": "Your password was set successfully."
    },
    "mailer": {
      "confirmation_instructions": {
        "action": "Confirm my account",
        "greeting": "Welcome %{recipient}!",
        "instruction": "You can confirm your account email through the link below:",
        "subject": "Confirmation instructions"
      },
      "email_changed": {
        "subject": "Email Changed"
      },
      "invitation_instructions": {
        "accept": "Accept invitation",
        "accept_until": "This invitation will be due in %{due_date}.",
        "hello": "Hello %{email}",
        "ignore": "If you don't want to accept the invitation, please ignore this email.<br />\\nYour account won't be created until you access the link above and set your password.",
        "someone_invited_you": "Someone has invited you to %{url}, you can accept it through the link below.",
        "subject": "The Talent Enterprise – Your Link to Thriving Index"
      },
      "password_change": {
        "greeting": "Hello %{recipient}!",
        "message": "We're contacting you to notify you that your password has been changed.",
        "subject": "Password Changed"
      },
      "reset_password_instructions": {
        "action": "Change my password",
        "greeting": "Hello %{recipient}!",
        "instruction": "Someone has requested a link to change your password, and you can do this through the link below.",
        "instruction_2": "If you didn't request this, please ignore this email.",
        "instruction_3": "Your password won't change until you access the link above and create a new one.",
        "subject": "Reset password instructions"
      },
      "unlock_instructions": {
        "action": "Unlock my account",
        "greeting": "Hello %{recipient}!",
        "instruction": "Click the link below to unlock your account:",
        "message": "Your account has been locked due to an excessive amount of unsuccessful sign in attempts.",
        "subject": "Unlock instructions"
      }
    },
    "omniauth_callbacks": {
      "failure": "Could not authenticate you from %{kind} because \"%{reason}\".",
      "success": "Successfully authenticated from %{kind} account."
    },
    "passwords": {
      "edit": {
        "change_my_password": "Change my password",
        "change_your_password": "Change your password",
        "confirm_new_password": "Confirm new password",
        "description": "To create a new password, please enter your new password in the boxes below.",
        "new_password": "New password",
        "title": "Create Password"
      },
      "new": {
        "back": "Return back",
        "description": "Please enter your email address in the box below and click 'Reset Password'.",
        "email_label": "Email Address",
        "forgot_your_password": "Forgot your password?",
        "send_me_reset_password_instructions": "Send me reset password instructions",
        "submit": "Reset Password",
        "title": "Forgotten Password"
      },
      "no_token": "You can't access this page without coming from a password reset email. If you do come from a password reset email, please make sure you used the full URL provided.",
      "send_instructions": "You will receive an email with instructions on how to reset your password in a few minutes.",
      "send_paranoid_instructions": "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.",
      "updated": "Your password has been changed successfully. You are now signed in.",
      "updated_not_active": "Your password has been changed successfully."
    },
    "registrations": {
      "destroyed": "Bye! Your account has been successfully cancelled. We hope to see you again soon.",
      "edit": {
        "are_you_sure": "Are you sure?",
        "cancel_my_account": "Cancel my account",
        "currently_waiting_confirmation_for_email": "Currently waiting confirmation for: %{email}",
        "leave_blank_if_you_don_t_want_to_change_it": "leave blank if you don't want to change it",
        "title": "Edit %{resource}",
        "unhappy": "Unhappy",
        "update": "Update",
        "we_need_your_current_password_to_confirm_your_changes": "we need your current password to confirm your changes"
      },
      "new": {
        "sign_up": "Sign up",
        "submit": "Register",
        "tabs": {
          "register": "Register",
          "sign_in": "Sign In"
        }
      },
      "signed_up": "Welcome! You have signed up successfully.",
      "signed_up_but_inactive": "You have signed up successfully. However, we could not sign you in because your account is not yet activated.",
      "signed_up_but_locked": "You have signed up successfully. However, we could not sign you in because your account is locked.",
      "signed_up_but_unconfirmed": "A message with a confirmation link has been sent to your email address. Please follow the link to activate your account.",
      "update_needs_confirmation": "You updated your account successfully, but we need to verify your new email address. Please check your email and follow the confirm link to confirm your new email address.",
      "updated": "Your account has been updated successfully."
    },
    "sessions": {
      "already_signed_out": "Signed out successfully.",
      "new": {
        "email_label": "Email Address",
        "forgot_password": "Forgot password?",
        "keep_sign_in": "Yes, Keep me signed in",
        "password_placeholder": "Enter your password",
        "sign_in": "Sign in",
        "submit": "Login",
        "tabs": {
          "register": "Register",
          "sign_in": "Login"
        }
      },
      "signed_in": "Signed in successfully.",
      "signed_out": "Signed out successfully."
    },
    "shared": {
      "links": {
        "back": "Back",
        "didn_t_receive_confirmation_instructions": "Didn't receive confirmation instructions?",
        "didn_t_receive_unlock_instructions": "Didn't receive unlock instructions?",
        "forgot_your_password": "Forgot your password?",
        "sign_in": "Sign in",
        "sign_in_with_provider": "Sign in with %{provider}",
        "sign_up": "Sign up"
      }
    },
    "unlocks": {
      "new": {
        "resend_unlock_instructions": "Resend unlock instructions"
      },
      "send_instructions": "You will receive an email with instructions for how to unlock your account in a few minutes.",
      "send_paranoid_instructions": "If your account exists, you will receive an email with instructions for how to unlock it in a few minutes.",
      "unlocked": "Your account has been unlocked successfully. Please login to continue."
    }
  },
  "ecommerce": {
    "carts": {
      "show": {
        "back_to_catalogue": "Back to Catalogue",
        "next": "Next",
        "shopping_basket": "Shopping Basket",
        "total": "Total:",
        "update_basket": "Update Basket"
      }
    },
    "orders": {
      "new": {
        "back_to_basket": "Back to Basket",
        "order": "Order",
        "pay": "Pay",
        "product_name": "Product Name",
        "product_price": "Product Price",
        "product_quantity": "Quantity",
        "product_subtotal": "Positions Price",
        "total": "Total",
        "users": "Users"
      },
      "success": {
        "back_to_basket": "Back to Basket",
        "body": "<h3>Payment successful</h3>\n<p>We will email you a receipt confirming your oder shortly.</p>\n",
        "go_to_dashboard": "Go to Dashboard",
        "title": "Payment Successful"
      }
    },
    "products": {
      "add_to_cart": {
        "successfully": "Assessment was successfuly added to the basket"
      },
      "index": {
        "assessment_catalogue": "Assessment Catalogue",
        "shopping_basket": "Shopping Basket"
      }
    },
    "users": {
      "registrations": {
        "new": {
          "register": "Register",
          "sign_in": "Sign in"
        }
      },
      "sessions": {
        "new": {
          "register": "Register",
          "sign_in": "Sign in"
        }
      }
    }
  },
  "enums": {
    "communication": {
      "delivery_rule": {
        "in_progress": "If assessment is in progress",
        "not_competed": "If assessment is not completed",
        "not_started": "If assessment is not started",
        "send_now": "Send now",
        "specific_datetime": "Send at"
      },
      "kind": {
        "completion": "Completion",
        "invitation": "Invitation",
        "other": "Other",
        "reminder": "Reminder"
      },
      "recipients": {
        "all": "All",
        "selected": "Selected"
      }
    },
    "report": {
      "type": {
        "common": "Any",
        "eti": "ETI",
        "yti": "YTI"
      }
    }
  },
  "errors": {
    "connection_refused": "Oops! Failed to connect to the Web Console middleware.\nPlease make sure a rails development server is running.\n",
    "error_500": "Something went wrong. Contact your administrator.",
    "format": "%{attribute} %{message}",
    "invalid_token": "Something went wrong. Plese reload the page and try again.",
    "messages": {
      "accepted": "must be accepted",
      "after": "must be after %{date}",
      "after_or_equal_to": "must be after or equal to %{date}",
      "allowed_file_content_types": "file should be one of %{types}",
      "already_confirmed": "was already confirmed, please try signing in",
      "before": "must be before %{date}",
      "before_or_equal_to": "must be before or equal to %{date}",
      "blank": "can't be blank",
      "carrierwave_direct_allowed_extensions": "Allowed file types are %{extensions}",
      "carrierwave_direct_allowed_schemes": "Allowed schemes are %{schemes}",
      "carrierwave_direct_attachment_missing": "attachment is missing",
      "carrierwave_direct_filename_invalid": "is invalid. ",
      "carrierwave_direct_filename_taken": "filename was already taken",
      "carrierwave_direct_upload_missing": "upload is missing",
      "carrierwave_download_error": "could not be downloaded",
      "carrierwave_integrity_error": "is not of an allowed file type",
      "carrierwave_processing_error": "failed to be processed",
      "confirmation": "doesn't match %{attribute}",
      "confirmation_period_expired": "needs to be confirmed within %{period}, please request a new one",
      "content_type_blacklist_error": "You are not allowed to upload %{content_type} files",
      "content_type_whitelist_error": "You are not allowed to upload %{content_type} files",
      "empty": "can't be empty",
      "equal_to": "must be equal to %{date}",
      "even": "must be even",
      "excluded_file_content_types": "file cannot be %{types}",
      "exclusion": "is reserved",
      "expired": "has expired, please request a new one",
      "extension_blacklist_error": "You are not allowed to upload %{extension} files, prohibited types: %{prohibited_types}",
      "extension_whitelist_error": "You are not allowed to upload %{extension} files, allowed types: %{allowed_types}",
      "file_size_is_greater_than": "file size must be greater than %{count}",
      "file_size_is_greater_than_or_equal_to": "file size must be greater than or equal to %{count}",
      "file_size_is_in": "file size must be between %{min} and %{max}",
      "file_size_is_less_than": "file size must be less than %{count}",
      "file_size_is_less_than_or_equal_to": "file size must be less than or equal to %{count}",
      "greater_than": "must be greater than %{count}",
      "greater_than_or_equal_to": "must be greater than or equal to %{count}",
      "inclusion": "is not included in the list",
      "invalid": "is invalid",
      "invalid_currency": "must be a valid currency (eg. '100', '5%{decimal}24', or '123%{thousands}456%{decimal}78'). Got %{currency}",
      "less_than": "must be less than %{count}",
      "less_than_or_equal_to": "must be less than or equal to %{count}",
      "max_size_error": "File size should be less than %{max_size}",
      "min_size_error": "File size should be greater than %{min_size}",
      "mini_magick_processing_error": "Failed to manipulate with MiniMagick, maybe it is not an image? Original Error: %{e}",
      "model_invalid": "Validation failed: %{errors}",
      "not_a_date": "is not a date",
      "not_a_number": "is not a number",
      "not_an_integer": "must be an integer",
      "not_found": "not found",
      "not_locked": "was not locked",
      "not_saved": {
        "one": "1 error prohibited this %{resource} from being saved:",
        "other": "%{count} errors prohibited this %{resource} from being saved:"
      },
      "odd": "must be odd",
      "other_than": "must be other than %{count}",
      "present": "must be blank",
      "required": "must exist",
      "rmagick_processing_error": "Failed to manipulate with rmagick, maybe it is not an image?",
      "taken": "has already been taken",
      "too_long": {
        "one": "is too long (maximum is 1 character)",
        "other": "is too long (maximum is %{count} characters)"
      },
      "too_short": {
        "one": "is too short (minimum is 1 character)",
        "other": "is too short (minimum is %{count} characters)"
      },
      "wrong_length": {
        "one": "is the wrong length (should be 1 character)",
        "other": "is the wrong length (should be %{count} characters)"
      }
    },
    "try_again": "Please try again",
    "unacceptable_request": "A supported version is expected in the Accept header.\n",
    "unavailable_session": "Session %{id} is is no longer available in memory.\n\nIf you happen to run on a multi-process server (like Unicorn or Puma) the process\nthis request hit doesn't store %{id} in memory. Consider turning the number of\nprocesses/workers to one (1) or using a different server in development.\n"
  },
  "flash": {
    "actions": {
      "create": {
        "notice": "%{resource_name} was successfully created."
      },
      "destroy": {
        "alert": "%{resource_name} could not be destroyed.",
        "notice": "%{resource_name} was successfully destroyed."
      },
      "update": {
        "notice": "%{resource_name} was successfully updated."
      }
    }
  },
  "helpers": {
    "page_entries_info": {
      "more_pages": {
        "display_entries": "Displaying %{entry_name} <b>%{first}&nbsp;-&nbsp;%{last}</b> of <b>%{total}</b> in total"
      },
      "one_page": {
        "display_entries": {
          "one": "Displaying <b>1</b> %{entry_name}",
          "other": "Displaying <b>all %{count}</b> %{entry_name}",
          "zero": "No %{entry_name} found"
        }
      }
    },
    "select": {
      "prompt": "Please select"
    },
    "submit": {
      "create": "Create %{model}",
      "submit": "Save %{model}",
      "update": "Update %{model}"
    }
  },
  "hogan": {
    "assigns": {
      "results": {
        "not_completed": "Hogan Report isn't ready yet",
        "successfully": "Hogan Report was successfully saved"
      }
    }
  },
  "home": {
    "survey_instructions": {
      "title": "Instructions"
    }
  },
  "i18n_tasks": {
    "add_missing": {
      "added": {
        "one": "Added %{count} key",
        "other": "Added %{count} keys"
      }
    },
    "cmd": {
      "args": {
        "default_text": "Default: %{value}",
        "desc": {
          "all_locales": "Do not expect key patterns to start with a locale, instead apply them to all locales implicitly.",
          "confirm": "Confirm automatically",
          "data_format": "Data format: %{valid_text}.",
          "keep_order": "Keep the order of the keys",
          "key_pattern": "Filter by key pattern (e.g. 'common.*')",
          "key_pattern_to_rename": "Full key (pattern) to rename. Required",
          "locale": "i18n_tasks.common.locale",
          "locale_to_translate_from": "Locale to translate from",
          "locales_filter": "Locale(s) to process. Special: base",
          "missing_types": "Filter by types: %{valid}",
          "new_key_name": "New name, interpolates original name as %{key}. Required",
          "nostdin": "Do not read from stdin",
          "out_format": "Output format: %{valid_text}",
          "pattern_router": "Use pattern router: keys moved per config data.write",
          "strict": "Avoid inferring dynamic key usages such as t(\"cats.#{cat}.name\"). Takes precedence over the config setting if set.",
          "translation_backend": "Translation backend (google or deepl)",
          "value": "Value. Interpolates: %{value}, %{human_key}, %{key}, %{default}, %{value_or_human_key}, %{value_or_default_or_human_key}"
        }
      },
      "desc": {
        "add_missing": "add missing keys to locale data",
        "check_consistent_interpolations": "verify that all translations use correct interpolation variables",
        "check_normalized": "verify that all translation data is normalized",
        "config": "display i18n-tasks configuration",
        "data": "show locale data",
        "data_merge": "merge locale data with trees",
        "data_remove": "remove keys present in tree from data",
        "data_write": "replace locale data with tree",
        "eq_base": "show translations equal to base value",
        "find": "show where keys are used in the code",
        "gem_path": "show path to the gem",
        "health": "is everything OK?",
        "irb": "start REPL session within i18n-tasks context",
        "missing": "show missing translations",
        "mv": "rename/merge the keys in locale data that match the given pattern",
        "normalize": "normalize translation data: sort and move to the right files",
        "remove_unused": "remove unused keys",
        "rm": "remove the keys in locale data that match the given pattern",
        "translate_missing": "translate missing keys with Google Translate or DeepL Pro",
        "tree_convert": "convert tree between formats",
        "tree_filter": "filter tree by key pattern",
        "tree_merge": "merge trees",
        "tree_mv_key": "rename/merge/remove the keys matching the given pattern",
        "tree_set_value": "set values of keys, optionally match a pattern",
        "tree_subtract": "tree A minus the keys in tree B",
        "tree_translate": "Google Translate a tree to root locales",
        "unused": "show unused translations"
      },
      "encourage": [
        "Good job!",
        "Well done!",
        "Perfect!"
      ],
      "enum_list_opt": {
        "invalid": "%{invalid} is not in: %{valid}."
      },
      "enum_opt": {
        "invalid": "%{invalid} is not one of: %{valid}."
      },
      "errors": {
        "invalid_format": "invalid format: %{invalid}. valid: %{valid}.",
        "invalid_locale": "invalid locale: %{invalid}",
        "invalid_missing_type": {
          "one": "invalid type: %{invalid}. valid: %{valid}.",
          "other": "unknown types: %{invalid}. valid: %{valid}."
        },
        "pass_forest": "pass locale forest"
      }
    },
    "common": {
      "continue_q": "Continue?",
      "key": "Key",
      "locale": "Locale",
      "n_more": "%{count} more",
      "value": "Value"
    },
    "data_stats": {
      "text": "has %{key_count} keys across %{locale_count} locales. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments, a locale has %{per_locale_avg} keys.",
      "text_single_locale": "has %{key_count} keys in total. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments.",
      "title": "Forest (%{locales})"
    },
    "deepl_translate": {
      "errors": {
        "no_api_key": "Setup DeepL Pro API key via DEEPL_AUTH_KEY environment variable or translation.deepl_api_key in config/i18n-tasks.yml. Get the key at https://www.deepl.com/pro.",
        "no_results": "DeepL returned no results."
      }
    },
    "google_translate": {
      "errors": {
        "no_api_key": "Set Google API key via GOOGLE_TRANSLATE_API_KEY environment variable or translation.google_translate_api_key in config/i18n-tasks.yml. Get the key at https://code.google.com/apis/console.",
        "no_results": "Google Translate returned no results. Make sure billing information is set at https://code.google.com/apis/console."
      }
    },
    "health": {
      "no_keys_detected": "No keys detected. Check data.read in config/i18n-tasks.yml."
    },
    "inconsistent_interpolations": {
      "none": "No inconsistent interpolations found."
    },
    "missing": {
      "details_title": "Value in other locales or source",
      "none": "No translations are missing."
    },
    "remove_unused": {
      "confirm": {
        "one": "%{count} translation will be removed from %{locales}.",
        "other": "%{count} translation will be removed from %{locales}."
      },
      "noop": "No unused keys to remove",
      "removed": "Removed %{count} keys"
    },
    "translate_missing": {
      "translated": "Translated %{count} keys"
    },
    "unused": {
      "none": "Every translation is in use."
    },
    "usages": {
      "none": "No key usages found."
    }
  },
  "invites": {
    "create": {
      "successfully": "Your invitations was successfully sent"
    },
    "form": {
      "emails_hint": "Set each email in new line",
      "send_invites": "Send Invites"
    },
    "new": {
      "header": "Invite Form"
    }
  },
  "jobs": {
    "threesixty": {
      "reports": {
        "download": {
          "description": "To download the report, please follow link: <a href='%{url}' target='_blank'>Download</a>",
          "message": "Report is ready"
        }
      }
    }
  },
  "languages": {
    "ar": "Arabic",
    "bg": "Bulgarian",
    "bs": "Bosnian",
    "ca": "Catalan",
    "cn": "Chinese",
    "cs": "Czech",
    "cy": "Welsh",
    "da": "Danish",
    "de": "German",
    "el": "Greek",
    "en": "English",
    "en-GB": "English - UK",
    "eo": "Esperanto",
    "es": "Spanish (Latin America)",
    "es-ES": "Spanish (Spain)",
    "et": "Estonian",
    "fa": "Persian",
    "fi": "Finnish",
    "fr": "French",
    "gu": "Gujarati",
    "he": "Hebrew",
    "hi": "Hindi",
    "hr": "Croatian",
    "hu": "Hungarian",
    "id": "Bahasa Indonesia",
    "it": "Italian",
    "ja": "Japanese",
    "km": "Khmer",
    "ko": "Korean",
    "lt": "Lithuanian",
    "lv": "Latvian",
    "mk": "Macedonian",
    "mn": "Mongolian",
    "ms": "Bahasa Malaysia",
    "my": "Myanmar",
    "nl": "Dutch",
    "no": "Norwegian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pt-BR": "Brazilian Portuguese",
    "ro": "Romanian",
    "ru": "Russian",
    "sk": "Slovak",
    "sl": "Slovenian",
    "sr": "Serbian",
    "sv": "Swedish",
    "sw": "Swahili",
    "ta": "Tamil",
    "th": "Thai",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "vi": "Vietnamese",
    "zh": "Chinese Simplified",
    "zh-TW": "Chinese Traditional"
  },
  "layouts": {
    "users": {
      "dashboard": "Dashboard",
      "help": "Help",
      "logout": "Log Out",
      "menu": "Menu",
      "notifications": "Notifications",
      "profile": "Profile"
    }
  },
  "loading": "Processing...",
  "mailer": {
    "from": "The Talent Enterprise"
  },
  "managers": {
    "assessments": {
      "index": {
        "actions": "Actions",
        "name": "Name"
      },
      "resource": {
        "action_planning": "Action Planning"
      }
    },
    "assigns": {
      "index": {
        "title": "Assessments and Reporting Centre"
      },
      "list": {
        "action": "Action",
        "assessment_name": "Assessment Name",
        "assessment_type": "Assessment Type",
        "completion_date": "Completion Date",
        "name": "Name",
        "status": "Completion Status"
      },
      "resource": {
        "email": "Email",
        "save": "Save in PDF",
        "view": "View"
      }
    },
    "dashboard": {
      "index": {
        "assessment_center": "Assessment / Report Centre",
        "notification_center": "Notification Centre",
        "notifications": "Notifications",
        "relationships": "Company Relationships",
        "reporting": "Reporting",
        "statistics": "Statistics"
      }
    },
    "notifications": {
      "index": {
        "subtitle": "Notifications",
        "title": "Notification Centre"
      }
    },
    "reports": {
      "show": {
        "export_pdf": "Export to PDF",
        "header": "Report"
      }
    },
    "statistics": {
      "index": {
        "title": "Statistics"
      }
    },
    "tasks": {
      "comment": {
        "made_comment": "made a comment."
      },
      "edit": {
        "header": "Update Action Item"
      },
      "index": {
        "subtitle": "Action Items",
        "title": "Action Planning Dashboard",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "actions": "Actions",
        "add_item": "Add Action Item",
        "competency": "Competency",
        "high": "High Priority",
        "low": "Low Priority",
        "medium": "Medium Priority",
        "subtitle_high": "High Priority Items",
        "subtitle_low": "Low Priority Items",
        "subtitle_medium": "Medium Priority Items",
        "summary": "Showing %{total} of %{total} entries."
      },
      "new": {
        "header": "Create Action Item"
      },
      "resource": {
        "tooltips": {
          "delete": "Delete Action Item",
          "edit": "Edit Action Item"
        }
      },
      "resource_extension": {
        "add": "Add Sub Action Item",
        "add_comment": "Add Comment",
        "leave_comment": "Leave a comment/note:",
        "notes": "Notes/Comments:",
        "sub_tasks": "Sub Action Items"
      },
      "subtasks": {
        "list": {
          "actions": "Actions",
          "date": "Target Completion Date",
          "name": "Action Item",
          "status": "Status"
        }
      },
      "summary": {
        "completed": "Completed",
        "in_progress": "In Progress",
        "manager_summary": "Manager Summary",
        "not_started": "Not Started",
        "overdue": "Overdue",
        "total": "Total Items"
      },
      "summary_managers": {
        "assignee": "Assigner",
        "completed": "Completed",
        "in_progress": "In Progress",
        "not_started": "Not Started",
        "overdue": "Overdue"
      }
    },
    "users": {
      "index": {
        "title": "Company Relationships"
      }
    }
  },
  "mindmill": {
    "assigns": {
      "results": {
        "not_completed": "Mindmill Assessment not completed",
        "successfully": "Mindmill Assessment was successfully pass"
      }
    }
  },
  "next": "Next",
  "no": "No",
  "number": {
    "currency": {
      "format": {
        "delimiter": ",",
        "format": "%u%n",
        "precision": 2,
        "separator": ".",
        "significant": false,
        "strip_insignificant_zeros": false,
        "unit": "$"
      }
    },
    "format": {
      "delimiter": ",",
      "precision": 3,
      "separator": ".",
      "significant": false,
      "strip_insignificant_zeros": false
    },
    "human": {
      "decimal_units": {
        "format": "%n %u",
        "units": {
          "billion": "Billion",
          "million": "Million",
          "quadrillion": "Quadrillion",
          "thousand": "Thousand",
          "trillion": "Trillion",
          "unit": ""
        }
      },
      "format": {
        "delimiter": "",
        "precision": 3,
        "significant": true,
        "strip_insignificant_zeros": true
      },
      "storage_units": {
        "format": "%n %u",
        "units": {
          "byte": {
            "one": "Byte",
            "other": "Bytes"
          },
          "eb": "EB",
          "gb": "GB",
          "kb": "KB",
          "mb": "MB",
          "pb": "PB",
          "tb": "TB"
        }
      }
    },
    "percentage": {
      "format": {
        "delimiter": "",
        "format": "%n%"
      }
    },
    "precision": {
      "format": {
        "delimiter": ""
      }
    }
  },
  "profiles": {
    "edit": {
      "header": "Profile Settings"
    },
    "form": {
      "username": "Username"
    },
    "update": {
      "successfully": "Profile updated"
    }
  },
  "ransack": {
    "all": "all",
    "and": "and",
    "any": "any",
    "asc": "ascending",
    "attribute": "attribute",
    "combinator": "combinator",
    "condition": "condition",
    "desc": "descending",
    "or": "or",
    "predicate": "predicate",
    "predicates": {
      "blank": "is blank",
      "cont": "contains",
      "cont_all": "contains all",
      "cont_any": "contains any",
      "does_not_match": "doesn't match",
      "does_not_match_all": "doesn't match all",
      "does_not_match_any": "doesn't match any",
      "end": "ends with",
      "end_all": "ends with all",
      "end_any": "ends with any",
      "eq": "equals",
      "eq_all": "equals all",
      "eq_any": "equals any",
      "false": "is false",
      "gt": "greater than",
      "gt_all": "greater than all",
      "gt_any": "greater than any",
      "gteq": "greater than or equal to",
      "gteq_all": "greater than or equal to all",
      "gteq_any": "greater than or equal to any",
      "in": "in",
      "in_all": "in all",
      "in_any": "in any",
      "lt": "less than",
      "lt_all": "less than all",
      "lt_any": "less than any",
      "lteq": "less than or equal to",
      "lteq_all": "less than or equal to all",
      "lteq_any": "less than or equal to any",
      "matches": "matches",
      "matches_all": "matches all",
      "matches_any": "matches any",
      "not_cont": "doesn't contain",
      "not_cont_all": "doesn't contain all",
      "not_cont_any": "doesn't contain any",
      "not_end": "doesn't end with",
      "not_end_all": "doesn't end with all",
      "not_end_any": "doesn't end with any",
      "not_eq": "not equal to",
      "not_eq_all": "not equal to all",
      "not_eq_any": "not equal to any",
      "not_in": "not in",
      "not_in_all": "not in all",
      "not_in_any": "not in any",
      "not_null": "is not null",
      "not_start": "doesn't start with",
      "not_start_all": "doesn't start with all",
      "not_start_any": "doesn't start with any",
      "null": "is null",
      "present": "is present",
      "start": "starts with",
      "start_all": "starts with all",
      "start_any": "starts with any",
      "true": "is true"
    },
    "search": "search",
    "sort": "sort",
    "value": "value"
  },
  "reports": {
    "modules": {
      "common": {
        "almost_always": "Almost Always",
        "less_typical": "Less Typical",
        "moderate": "Moderate",
        "more_typical": "More Typical",
        "rare": "Rare"
      },
      "cpi_occupations": {
        "occupations": "Occupations",
        "your_potential_suitability": "Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "Gap",
        "item": "Item",
        "negative_gap": "Negative Gaps",
        "no_negative_gaps": "There are no Negative Gaps",
        "no_positive_gaps": "There are no Positive Gaps",
        "positive_gap": "Positive Gaps",
        "rank": "Rank",
        "scoring_category": "Scoring Category"
      },
      "highest_lowest": {
        "average": "Average",
        "bottom_5": "BOTTOM 5",
        "category": "Category",
        "email": "Email",
        "first_name": "First Name",
        "highest_scores": "Highest Scores",
        "item": "Item",
        "last_name": "Last Name",
        "lowest_scores": "Lowest scores",
        "mean_score": "Mean Score",
        "rank": "Rank",
        "result": "Result",
        "score": "Score",
        "scoring_category": "Scoring Category",
        "sub_competenties": "Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "career_strengths_and_results": "Career Strengths and Your Results",
        "career_sub_tracks": "Career Sub-tracks",
        "detailed_career_guide": "Detailed Career Guide",
        "diploma_qualification": "Diploma Qualification",
        "education_level": "Education Level",
        "high_school_entry_roles": "High School Entry Roles",
        "key_career_tracks_within": "Below is a list of potential job roles for each of the career tracks. Remember this list is indicative only, and not exhaustive. Do note that roles in italics require higher levels of education and / or experience.",
        "potential_areas_of_study": "Potential Areas of Study",
        "potential_roles": "Potential Roles",
        "strength_high": "Signature Strength",
        "strength_low": "Developmental Strength",
        "strength_moderate": "Potential Strength",
        "work_environment": "Work Environment",
        "your_suitability": "Your Suitability"
      },
      "potential_career_short": {
        "career": "career",
        "for_this": "for this",
        "key": "key",
        "strengths": "strengths",
        "your_scores": "Your Scores"
      },
      "single_value": {
        "factor_name": "Scoring Category",
        "question_name": "Questions"
      },
      "single_value_cluster": {
        "competency": "Competency",
        "description": "Description",
        "developmental_rating": "Developmental Rating",
        "questions": "Questions"
      },
      "strength_clusters": {
        "index_sub_factors_considered": "Thriving Index sub-factors that have been considered to provide your final score for the %{workstyle} work environment",
        "possible_roles": "Possible Roles",
        "work_environments": "Expected Work Environments"
      },
      "three_sixty_default": {
        "factor": {
          "items": "Items",
          "max": "Max Value",
          "mean": "Mean",
          "min": "Min Value",
          "standardDeviation": "Standard Deviation",
          "sum": "Sum",
          "totalResponses": "Total Responses",
          "variance": "Variance",
          "weightedMean": "Weighted Mean"
        },
        "statistic": "Statistic",
        "value": "Value"
      },
      "three_sixty_report_summary": {
        "number_by_filter_evaluations_received": "Number of %{filter} evaluations received",
        "number_of_evaluators_invited": "Number of evaluators invited",
        "number_of_evaluators_received": "Number of evaluations received",
        "number_of_evaluators_responded": "Number of evaluators responded",
        "subject": "Subject",
        "total_evaluations": "Total evaluations for this assessment"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Report"
    },
    "statuses": {
      "approved": "Approved",
      "available": "Available",
      "denied": "Denied",
      "incomplete": "Incomplete",
      "not_available": "Not available",
      "on_hold": "On hold"
    }
  },
  "simple_form": {
    "error_notification": {
      "default_message": "Please review the problems below:"
    },
    "labels": {
      "client": {
        "account_manager": "TTE Account Manager",
        "account_manager_id": "TTE Account Manager",
        "applicable_level": "Applicable Level",
        "applicable_levels": {
          "campaign": "Campaign",
          "project": "Project",
          "sub_campaign": "Sub-Campaign"
        },
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License Expiry Date",
        "licenses_used": "License Usage",
        "location": "Location",
        "logo": "Client logo",
        "memberships_count": "Users",
        "name": "Name",
        "number": "Client Number",
        "privacy_consent": "Enable data processing consent",
        "project_manager": "TTE Project Manager",
        "project_manager_id": "TTE Project Manager",
        "report_ids": "Reports",
        "subdomain": "Subdomain",
        "types": {
          "associate": "Associate",
          "corporate": "Corporate",
          "distributer": "Distributer",
          "other": "Other",
          "partner": "Partner",
          "retail": "Retail",
          "tte": "TTE"
        },
        "updated_at": "Modified Date",
        "year": "Client Year"
      },
      "membership": {
        "role": "Membership role"
      }
    },
    "no": "No",
    "placeholders": {
      "administration/assessments/assign_form": {
        "access_reports": "Access Report Rules",
        "access_reports_at": "Access Report at",
        "access_reports_at_date": "Date",
        "access_reports_at_time": "Time",
        "client_ids": "Client Tenancies",
        "manager_ids": "Managers",
        "report_ids": "Reports",
        "user_ids": "Users"
      },
      "administrator": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Client Tenancy",
        "memberships": "Client Tenancy",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "admins": {
            "admin": "Admin",
            "project_admin": "Project Admin",
            "regular": "Client Admin",
            "superadmin": "Super Admin"
          },
          "manager": "Manager",
          "member": "User",
          "regular": "Regular",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      },
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "case_study": "Case Studies",
          "hogan": "Hogan",
          "mindmill": "Mindmill",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "completed_at": "Completion Date",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "statuses": {
          "completed": "Completed",
          "finished": "finished",
          "in_progress": "Resume",
          "not_started": "New",
          "overdue": "Overdue"
        },
        "timing": "Timing",
        "types": {
          "common": "TTE Assessment",
          "hogan": "Hogan",
          "mindmill": "Mindmill Assessment"
        },
        "updated_at": "Modified Date"
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "account_manager": "TTE Account Manager",
        "account_manager_id": "TTE Account Manager",
        "applicable_level": "Applicable Level",
        "applicable_levels": {
          "campaign": "Campaign",
          "project": "Project",
          "sub_campaign": "Sub-Campaign"
        },
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License Expiry Date",
        "licenses_used": "License Usage",
        "location": "Location",
        "logo": "Client logo",
        "memberships_count": "Users",
        "name": "Name",
        "number": "Client Number",
        "privacy_consent": "Enable data processing consent",
        "project_manager": "TTE Project Manager",
        "project_manager_id": "TTE Project Manager",
        "report_ids": "Reports",
        "subdomain": "Subdomain",
        "types": {
          "associate": "Associate",
          "corporate": "Corporate",
          "distributer": "Distributer",
          "other": "Other",
          "partner": "Partner",
          "retail": "Retail",
          "tte": "TTE"
        },
        "updated_at": "Modified Date",
        "year": "Client Year"
      },
      "communication": {
        "created_at": "Created Date",
        "id": "ID",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. of Questions",
        "subfactors_count": "No. of Sub-Factors",
        "updated_at": "Modified Date"
      },
      "library": {
        "created_at": "Created Date",
        "id": "ID",
        "type": "Thumbnail",
        "updated_at": "Modified Date"
      },
      "license": {
        "id": "ID",
        "number": "License Number",
        "overuse_number": "Over Use Allowance",
        "type": "License for",
        "unlimited": "Unlimited",
        "used_number": "Used License Number"
      },
      "memebrship": {
        "active": "Active",
        "created_at": "Created Date",
        "disabled": "Disable",
        "email": "Email",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "parent": "Direct Manager",
        "parent_id": "Direct Manager",
        "report_ids": "Report IDs",
        "roles": {
          "client_admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "project_admin": "Project Admin"
        },
        "updated_at": "Modified Date",
        "user_access": "User Access"
      },
      "norm": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "description_label": "DESCRIPTION",
        "diploma_qualification": "Diploma Qualification",
        "factor_id": "Competency",
        "factor_id_label": "SELECT COMPETENCY",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "membership_id": "Assigner",
        "membership_id_label": "SELECT ASSIGNER",
        "name": "Name",
        "name_label": "ACTION ITEM",
        "planned_completed_at": "Due Date",
        "planned_completed_at_label": "SELECT DUE DATE",
        "potential_areas_of_study": "Potential Areas of Study",
        "priority": "Priority",
        "priority_label": "PRIORITY",
        "status": "Status",
        "status_label": "SELECT STATUS",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "Not Started",
          "overdue": "Overdue"
        },
        "updated_at": "Modified Date",
        "updated_by": "Edited by",
        "work_environment": "Work Environment"
      },
      "product": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "regenerate_reports": {
        "report_ids": "Reports"
      },
      "report": {
        "created_at": "Created Date",
        "id": "ID",
        "mindmill": "Load report from Mindmill",
        "mindmill_report": "Mindmill report",
        "updated_at": "Modified Date"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Client Tenancy",
        "memberships": "Client Tenancy",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "admins": {
            "admin": "Admin",
            "project_admin": "Project Admin",
            "regular": "Client Admin",
            "superadmin": "Super Admin"
          },
          "manager": "Manager",
          "member": "User",
          "regular": "Regular",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      },
      "user_form": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "parent": "Direct Manager",
        "parent_id": "Direct Manager",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "updated_at": "Modified Date"
      }
    },
    "required": {
      "mark": "*",
      "text": "required"
    },
    "yes": "Yes"
  },
  "subjects": {
    "statuses": {
      "completed": "Completed",
      "done": "Done",
      "not_completed": "Not Completed"
    }
  },
  "support": {
    "array": {
      "last_word_connector": ", and ",
      "two_words_connector": " and ",
      "words_connector": ", "
    }
  },
  "threesixty": {
    "add": "Add",
    "and": "And",
    "approve_all": "Approve All",
    "approve_all_successful": "Approved all nominations",
    "approve_evaluations": "Approve Evaluations",
    "approve_nominations": "Approve Nominations",
    "approve_reports": "Approve Reports",
    "approved": "Approved",
    "approving_mail_sent": "Mail for approving nomination has been sent to managers",
    "as_my": "as my",
    "back_to_tasks": "Back to tasks",
    "cancel": "Cancel",
    "decline": "Decline",
    "decline_invite": "Decline Invite",
    "denied": "Denied",
    "deny_all": "Deny All",
    "deny_all_successful": "Denied all nominations",
    "email_approve_request": "Email Approval Request",
    "evaluation": "Evaluation",
    "evaluations": "Evaluations",
    "help": "Help",
    "language": "Language",
    "my_projects": "My Projects",
    "nominate": "Nominate",
    "nominate_evaluators": "Nominate Evaluators to",
    "nomination": "Nomination",
    "nominations": "Nominations",
    "or": "Or",
    "page_title": "Signify 360° Review - Apply Level",
    "remind_all": "Remind All",
    "remind_mail_sent": "Reminders sent to evaluators who haven't completed the evaluation",
    "reports": "Reports",
    "select_relationnship": "Select Relationship",
    "select_relationship": "Select Relationship",
    "setup_nominations": "Set up nominations",
    "total_progress": "Total progress",
    "user_name_input_placeholder": "type name or email...",
    "validation_errors": "Validation Errors",
    "view_nominations": "View nominations",
    "waiting": "Waiting"
  },
  "time": {
    "am": "am",
    "formats": {
      "date": "%d/%m/%y",
      "datetimepicker_client": "DD/MM/YYYY hh:mm A",
      "datetimepicker_server": "%d/%m/%Y %I:%M %p",
      "datetimepicker_without_time_client": "DD/MM/YYYY",
      "datetimepicker_without_time_server": "%d/%m/%Y",
      "default": "%a, %d %b %Y %H:%M:%S %z",
      "devise": {
        "mailer": {
          "invitation_instructions": {
            "accept_until_format": "%B %d, %Y %I:%M %p"
          }
        }
      },
      "iso8601_without_seconds_and_timezone": "%Y-%m-%dT%H:%M",
      "long": "%B %d, %Y %H:%M",
      "short": "%d %b %Y / %H:%M",
      "short_date": "%-d %b %Y"
    },
    "pm": "pm"
  },
  "validations": {
    "character_range": "Your response must be at least %{min} and no more than %{max} characters.",
    "date": "Your response must be a valid date (dd/mm/yyyy)",
    "each_group_contains": "Each group needs to contain not less than %{min} and not more than %{max} items",
    "email": "Your response must be a valid email",
    "issue": "Issue",
    "least": "Please answer at least %{min} choice(s).",
    "least_hotspot": "Please answer at least %{min} choice(s).",
    "max_length": "Your response must be no more than %{max} characters.",
    "min_length": "Your response must be at least %{min} characters.",
    "must_rank_between": "Please assign a value from %{min} to %{max} for each item. Values may not be repeated.",
    "must_select": "Please select from %{min} to %{max} choices",
    "number": "Your response must be a number",
    "please_answer_question": "Please answer this question",
    "please_record_and_save_video_first": "Please record and save the video before you continue",
    "range": "Please answer at least %{min} and no more than %{max} choice(s).",
    "text": "Your response must not contain a numbers",
    "title": "Sorry, you cannot continue until you correct the following:"
  },
  "views": {
    "pagination": {
      "first": "&laquo; First",
      "last": "Last &raquo;",
      "next": "Next &rsaquo;",
      "previous": "&lsaquo; Prev",
      "truncate": "&hellip;"
    }
  },
  "yes": "Yes"
});
I18n.translations["ar"] = I18n.extend((I18n.translations["ar"] || {}), {
  "activemodel": {
    "attributes": {
      "assign_report": {
        "adding_report_ids": "Report(s)",
        "is_applying_to_existing_users": "Apply these changes to existing users",
        "report_family_id": "Report Bundle"
      },
      "datasheet": {
        "file": "File (.xlsx)"
      },
      "new_assessments_client": {
        "assessment_ids": "Assessments",
        "is_applying_to_existing_users": "Apply these changes to existing users"
      },
      "regenerate_reports": {
        "report_ids": "Reports"
      },
      "update_assessment": {
        "is_applying_to_existing_users": "Apply these changes to existing users"
      }
    },
    "errors": {
      "models": {
        "assign_report": {
          "attributes": {
            "adding_report_ids": {
              "not_linked_to_report_family": "You selected Reports which are not linked to selected Report Bundle",
              "report_family_disabled": "You selected disabled Report Bundle",
              "reports_disabled": "You selected disabled Report(s)"
            },
            "removing_report_ids": {
              "not_linked_to_report_family": "You selected Reports which are not linked to selected Report Bundle"
            }
          }
        },
        "create_all": {
          "attributes": {
            "evaluators": {
              "email_duplicated": "The subject and evaluator emails are duplicated"
            },
            "subjects": {
              "email_duplicated": "Some subjects have the same email"
            }
          }
        },
        "create_one": {
          "attributes": {
            "email": {
              "already_exists": "A subject with same email already exists",
              "blank": "Email can't be blank",
              "invalid": "Email is invalid"
            },
            "evaluator_email": {
              "already_exists": "The subject with this evaluator are already connected",
              "blank": "Evaluator Email can't be blank",
              "invalid": "Evaluator Email is invalid"
            },
            "evaluator_first_name": {
              "blank": "Evaluator first name can't be blank"
            },
            "evaluator_last_name": {
              "blank": "Evaluator last name can't be blank"
            },
            "first_name": {
              "blank": "First name can't be blank"
            },
            "last_name": {
              "blank": "Last name can't be blank"
            },
            "relationship_name": {
              "blank": "Relationship can't be blank",
              "invalid": "Relationship %{name} is invalid"
            },
            "subject_email": {
              "blank": "Subject Email can't be blank",
              "invalid": "Subject Email is invalid",
              "not_exists": "Subject not found with email address %{email}"
            }
          }
        },
        "datasheet": {
          "attributes": {
            "file": {
              "email_duplicate": "There are duplicates in Email column",
              "invalid_format": "Invalid format (.xlsx)",
              "no_email_column": "File does not contain Email column"
            }
          }
        },
        "email_schedule": {
          "attributes": {
            "from": {
              "blank": "From field can't be blank"
            },
            "reply_to_email": {
              "blank": "Reply to email field can't be blank",
              "invalid": "Reply to email is invalid"
            },
            "scheduled_date": {
              "blank": "Scheduled date field can't be blank"
            }
          }
        },
        "email_template": {
          "attributes": {
            "from": {
              "blank": "From field can't be blank"
            },
            "reply_to_email": {
              "blank": "Reply to email field can't be blank",
              "invalid": "Reply to email is invalid"
            }
          }
        },
        "email_template_test_mail": {
          "attributes": {
            "to_email": {
              "blank": "Email field can't be blank",
              "invalid": "Email is invalid"
            }
          }
        },
        "import_one": {
          "attributes": {
            "email": {
              "already_exists": "A subject with same email already exists",
              "blank": "Email can't be blank",
              "invalid": "Email is invalid"
            },
            "first_name": {
              "blank": "First name can't be blank"
            },
            "last_name": {
              "blank": "Last name can't be blank"
            },
            "password": {
              "too_short": "Password is too short. Minimum 6 character required"
            }
          }
        },
        "profile": {
          "attributes": {
            "first_name": {
              "blank": "First name can't be blank"
            },
            "last_name": {
              "blank": "Last name can't be blank"
            },
            "password": {
              "too_short": "Password is too short. Minimum 6 character required"
            }
          }
        },
        "update_assessment": {
          "attributes": null
        }
      }
    },
    "models": {
      "assign_report": "Assign report Form",
      "datasheet": "Datasheet Form",
      "regenerate_reports": "Regenerate Reports",
      "update_assessment": "Update assessment Form"
    }
  },
  "activerecord": {
    "attributes": {
      "administration/assessments/assign_form": {
        "access_reports": "Access Report Rules",
        "access_reports_at": "Access Report at",
        "access_reports_at_date": "Date",
        "access_reports_at_time": "Time",
        "client_ids": "Client Tenancies",
        "manager_ids": "Managers",
        "report_ids": "Reports",
        "user_ids": "Users"
      },
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "case_study": "Case Studies",
          "hogan": "Hogan",
          "mindmill": "Mindmill",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "statuses": {
          "finished": "finished"
        },
        "timing": "Timing",
        "types": {
          "common": "TTE Assessment",
          "hogan": "Hogan",
          "mindmill": "Mindmill Assessment"
        },
        "updated_at": "Modified Date"
      },
      "assign": {
        "completed_at": "Completion Date",
        "statuses": {
          "completed": "Completed",
          "in_progress": "Resume",
          "not_started": "New",
          "overdue": "Overdue"
        }
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "account_manager": "TTE Account Manager",
        "account_manager_id": "TTE Account Manager",
        "applicable_level": "Applicable Level",
        "applicable_levels": {
          "campaign": "Campaign",
          "project": "Project",
          "sub_campaign": "Sub-Campaign"
        },
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License Expiry Date",
        "licenses_used": "License Usage",
        "location": "Location",
        "logo": "Client logo",
        "memberships_count": "Users",
        "name": "Name",
        "number": "Client Number",
        "privacy_consent": "Enable data processing consent",
        "project_manager": "TTE Project Manager",
        "project_manager_id": "TTE Project Manager",
        "report_ids": "Reports",
        "subdomain": "Subdomain",
        "types": {
          "associate": "Associate",
          "corporate": "Corporate",
          "distributer": "Distributer",
          "other": "Other",
          "partner": "Partner",
          "retail": "Retail",
          "tte": "TTE"
        },
        "updated_at": "Modified Date",
        "year": "Client Year"
      },
      "communication": {
        "created_at": "Created Date",
        "id": "ID",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. of Questions",
        "subfactors_count": "No. of Sub-Factors",
        "updated_at": "Modified Date"
      },
      "hogan_report_setting": {
        "load_report": "Load report from Hogan"
      },
      "library": {
        "created_at": "Created Date",
        "id": "ID",
        "type": "Thumbnail",
        "updated_at": "Modified Date"
      },
      "membership": {
        "active": "Active",
        "created_at": "Created Date",
        "disabled": "Disable",
        "email": "Email",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "parent": "Direct Manager",
        "parent_id": "Direct Manager",
        "report_ids": "Report IDs",
        "roles": {
          "client_admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "project_admin": "Project Admin"
        },
        "updated_at": "Modified Date",
        "user_access": "User Access"
      },
      "norm": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "occupation": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "diploma_qualification": "Diploma Qualification",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "name": "Name",
        "potential_areas_of_study": "Potential Areas of Study",
        "updated_at": "Modified Date",
        "work_environment": "Work Environment"
      },
      "occupations_factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "product": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "report": {
        "created_at": "Created Date",
        "id": "ID",
        "mindmill": "Load report from Mindmill",
        "mindmill_report": "Mindmill report",
        "updated_at": "Modified Date"
      },
      "report_family": {
        "created_at": "Created Date",
        "id": "ID",
        "updated_at": "Modified Date"
      },
      "task": {
        "active": "Active",
        "created_at": "Created Date",
        "description": "Description",
        "description_label": "DESCRIPTION",
        "factor_id": "Competency",
        "factor_id_label": "SELECT COMPETENCY",
        "id": "ID",
        "membership_id": "Assigner",
        "membership_id_label": "SELECT ASSIGNER",
        "name": "Action Item",
        "name_label": "ACTION ITEM",
        "planned_completed_at": "Due Date",
        "planned_completed_at_label": "SELECT DUE DATE",
        "priority": "Priority",
        "priority_label": "PRIORITY",
        "status": "Status",
        "status_label": "SELECT STATUS",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "Not Started",
          "overdue": "Overdue"
        },
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "كلمة المرور الحالية",
        "disabled": "Disable",
        "email": "البريد الإلكتروني",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Client Tenancy",
        "memberships": "Client Tenancy",
        "password": "كلمة المرود",
        "password_confirmation": "تأكيد كلمة المرور",
        "remember_me": "تذكرني",
        "reset_password_token": "Reset password token",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "admins": {
            "admin": "Admin",
            "project_admin": "Project Admin",
            "regular": "Client Admin",
            "superadmin": "Super Admin"
          },
          "manager": "Manager",
          "member": "User",
          "regular": "Regular",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "unlock_token": "Unlock token",
        "updated_at": "Modified Date"
      },
      "user_form": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "parent": "Direct Manager",
        "parent_id": "Direct Manager",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "updated_at": "Modified Date"
      }
    },
    "errors": {
      "messages": {
        "admin_for_another_tte": "User already admin in another tte",
        "not_uniqueness": "Assign has already been taken",
        "record_invalid": "Validation failed: %{errors}",
        "restrict_dependent_destroy": {
          "has_many": "Cannot delete record because dependent %{record} exist",
          "has_one": "Cannot delete record because a dependent %{record} exists"
        }
      },
      "models": {
        "factors_norm": {
          "score_from_must_be_number": "Score from must be number",
          "score_to_less_than_score_from": "Score to is less than Score from",
          "score_to_must_be_number": "Score to must be number"
        },
        "license": {
          "overuse": "License %{name} ssis overused"
        },
        "report": {
          "assessments_not_hogan": "All Assessments must be Hogan type",
          "has_already_assigned": "Assessment can’t be changed since it is already assigned to the user or applicable level",
          "has_dependent_relation": "This report is assinged on users",
          "max_assessment_count": "You have reached the limit of %{max} assessments",
          "min_assessment_count": "The minimum number of assessments is %{min}"
        }
      }
    },
    "models": {
      "administration/assessments/assign_form": "Assigns Form",
      "assessment": "Assessments",
      "assign": "Assigns",
      "block": "Block",
      "client": "Clients",
      "communication": "Communication",
      "dimension": "Dimensions",
      "factor": "Factors",
      "factors_norm": "factors_norms",
      "library": "Library",
      "membership": "Membership",
      "norm": "Norms",
      "occupation": "Occupations",
      "occupations_factor": "Occupations",
      "product": "Product",
      "question": "Question",
      "report": "Report",
      "report_family": "ReportFamily",
      "task": "Tasks",
      "user": "المستخدم",
      "user_form": "User"
    }
  },
  "administration": {
    "actions": "Actions",
    "active": "Active",
    "administrator": {
      "invitations": {
        "edit": {
          "confirm_password_label": "Confirm Password",
          "description": "To create a new password, please enter your new password in the boxes below.",
          "password_label": "Password",
          "submit": "Set New Password",
          "title": "Create password"
        }
      },
      "passwords": {
        "edit": {
          "confirm_password_label": "Confirm Password",
          "description": "To create a new password, please enter your new password in the boxes below.",
          "password_label": "Password",
          "submit": "Set New Password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "description": "Please enter your email address in the box below and click 'Reset Password'.",
          "email_label": "Email Address",
          "submit": "Reset Password",
          "title": "Forgotten Password"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "password_placeholder": "Enter your password",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": " Contact Us",
          "faqs": " FAQs",
          "privacy": "Privacy Statement",
          "terms_conditions": " Terms & Conditions"
        }
      }
    },
    "all": " - All - ",
    "any": " - Any - ",
    "assessments": {
      "assigns": {
        "create": {
          "successfully": "You successfully finished assigning %{name}"
        },
        "form": {
          "empty_client_ids": "Select clients to continue"
        },
        "new": {
          "help_block": "Select Clients and then click to the button \"Load Form\"",
          "load_form": "Load Form",
          "title": "Assign %{name} Assessment"
        },
        "users": {
          "filter": "Filter",
          "filter_form": "Filter form",
          "not_selected_users": "Not Selected Users",
          "selected_users": "Selected Users"
        }
      },
      "copy": {
        "error": "Assessment #%{name} was not copied.",
        "successfully": "Assessment %{name} was Copied Successfully."
      },
      "create": {
        "successfully": "Assessment %{name} was Created Successfully."
      },
      "dashboard": "Assessment Dashboard",
      "destroy": {
        "successfully": "Assessment %{name} was Destroyed Successfully."
      },
      "edit": {
        "header": "Assessment Settings"
      },
      "form": {
        "categories": {
          "360": "360 Feedback",
          "all": "All Categories",
          "case_study": "Case Studies",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "timing": {
          "hint": "For Example: 30 minutes to complete"
        }
      },
      "index": {
        "filterrific": {
          "with_category": {
            "360": "360 Feedback",
            "all": "All Categories",
            "case_study": "Case Studies",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "new": "Add",
        "owner": "Owner",
        "title": "Assessments",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New assessment"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
            "title": "Delete <strong>Assessment</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Assessment",
          "delete": "Delete Assessment",
          "edit": "Edit Assessment"
        }
      },
      "sidebar": {
        "assign": "Assign Assessment",
        "builder": "Questions Builder",
        "copy": "Copy Assessment",
        "destroy": "Delete Assessment",
        "disable": "Disable",
        "edit": "Assessment Settings",
        "enable": "Enable",
        "export": "Export Scoring",
        "new": "New Assessment",
        "preview": "Preview Assessment",
        "title": "Assessment's options"
      },
      "toggle_status": {
        "successfully": "Assessment %{name} was Updated Successfully."
      },
      "update": {
        "successfully": "Assessment %{name} was Updated Successfully."
      }
    },
    "assigns": {
      "create": {
        "successfully": "New assign to assessment was successfully created"
      },
      "destroy": {
        "successfully": "Assign to assessment was successfully deleted"
      },
      "index": {
        "title": "Reports"
      },
      "new": {
        "header": "Assign Assessment and Reports"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this assign?</p>",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        }
      }
    },
    "assigns_reports": {
      "edit": {
        "header": "Edit report assignment"
      }
    },
    "back": "Back",
    "base": {
      "top_sidebar": {
        "search": "Search...",
        "sign_out_message": {
          "body": "<p>Are you sure you want to log out?</p> <p>Press No if you want to continue work. Press Yes to logout current user.</p>",
          "title": "Log <strong>Out</strong> ?"
        }
      }
    },
    "blocks": {
      "destroy": {
        "successfully": "Block %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Block"
      },
      "new": {
        "header": "New Block"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Block?</p>\n",
            "title": "Delete <strong>Block</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Block?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "breadcrumbs": {
      "admins": "Admins",
      "assessments": "Assessments",
      "campaign_templates": "Campaign Templates",
      "campaigns": "Campaigns",
      "client": "Client Tenancy",
      "client_admins": "Client Admins",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "datasheets": "Datasheets",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "licenses": "Licenses",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "products": "Products",
      "project_admins": "Project Admins",
      "projects": "Projects",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "report_families": "Report Bundles",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_campaigns": "Sub Campaigns",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "bulk_reports": {
      "create": {
        "no_data": "No data is available for the report type and time range specified",
        "successfully": "The reports are being created and you will be notified via email when ready"
      },
      "download": {
        "removed": "Sorry, the file has been removed from the system after one week of storage"
      },
      "mailer": {
        "subject": "Download bulk reports"
      },
      "new": {
        "header": "Bulk Download"
      }
    },
    "cable": {
      "notification": {
        "assessment_factors": "Factors are fetched",
        "assessment_update": "Assessment is updated",
        "block_clone": "Block is copied",
        "block_create": "Block %{name} is created",
        "block_create_by_template": "Block was loaded from template",
        "block_destroy": "Block has been deleted",
        "block_move_down": "Block %{name} is moved down",
        "block_move_up": "Block %{name} is moved up",
        "block_permanent_destroy": "Block is permanently deleted",
        "block_rename": "Block is renamed",
        "block_restore": "Block is restored",
        "block_save_as_template": "Block saved as template",
        "block_unlink_template": "Block was unlinked",
        "block_update": "Block is updated",
        "comment_create": "Comment is created",
        "comment_destroy": "Comment has been deleted",
        "geo_filter": "Data filtered",
        "module_create": "Module %{name} is created",
        "module_destroy": "Module has been deleted",
        "module_insert_after": "Module is inserted after",
        "module_insert_before": "Module is inserted before",
        "module_move_down": "Module is moved down",
        "module_move_up": "Module is moved up",
        "module_rename": "Module is renamed",
        "module_update": "Module is updated",
        "page_create": "Page %{name} is created",
        "page_destroy": "Page has been deleted",
        "page_move_down": "Page %{name} is moved down",
        "page_move_up": "Page %{name} is moved up",
        "page_rename": "Page is renamed",
        "page_update": "Page is updated",
        "question_clone": "Question is copied",
        "question_create": "Question %{name} is created",
        "question_create_by_template": "Question was loaded from template",
        "question_create_from_template": "Question is created from template",
        "question_destroy": "Question has been deleted",
        "question_insert_after": "Question is inserted after",
        "question_insert_before": "Question is inserted before",
        "question_move_down": "Question is moved down",
        "question_move_up": "Question is moved up",
        "question_permanent_destroy": "Question is permanently deleted",
        "question_rename": "Question is renamed",
        "question_restore": "Question is restored",
        "question_save_as_template": "Question saved as template",
        "question_unlink_template": "Question was unlinked",
        "question_update": "Question is updated",
        "report_change_aliases": "Aliases are updated",
        "report_change_data_configuration": "Data Report Configuration was successfully updated",
        "report_change_filters": "Filters are updated",
        "report_update": "Report is updated",
        "scoring_update": "Scoring is updated",
        "trash_empty": "Trash Comment empty"
      }
    },
    "campaign_templates": {
      "base": {
        "active": "Active",
        "archived": "Archived",
        "disable": "Archive",
        "enable": "Unarchive"
      },
      "copy": {
        "error": "Client Tenancy %{name} was not copied.",
        "successfully": "Client Tenancy %{name} was successfully copied."
      },
      "create": {
        "successfully": "Client Tenancy %{name} was successfully created."
      },
      "designs": {
        "form": {
          "no_background": "No Background yet",
          "no_logo": "No Logo yet"
        }
      },
      "destroy": {
        "successfully": "Client Tenancy %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Client"
      },
      "export": {
        "admin": "Client Admin",
        "client_admins": "Client Admins",
        "report_bundle": "Report Bundle"
      },
      "index": {
        "export": "Export",
        "new": "Add",
        "title": "Campaign Templates"
      },
      "license": {
        "header": "%{name} - Edit license"
      },
      "licenses": {
        "update": {
          "duplicate_licenses": "You have duplicate licenses",
          "successfully": "Licenses successfully updated"
        }
      },
      "list": {
        "admin": "Client Admin",
        "client_admins": "Client Admins",
        "report_bundle": "Report Bundle"
      },
      "new": {
        "header": "New Client"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": {
              "0": "<p>Are you sure you want to delete?</p> <p>All Campaigns, Sub-campaigns and users will also be deleted</p>",
              "1": "<p>Are you sure you want to delete?</p> <p>All Sub-campaigns and users will also be deleted</p>",
              "2": "<p>Are you sure you want to delete?</p> <p>All users will also be deleted</p>"
            },
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "disable": {
            "body": {
              "0": "<p>Are you sure you want to archive?</p> <p>All Campaigns, Sub-campaigns and users will also be archived</p>",
              "1": "<p>Are you sure you want to archive?</p> <p>All Sub-campaigns and users will also be archived</p>",
              "2": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>",
              "3": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>"
            },
            "title": "Archive <strong>%{name}</strong> ?"
          },
          "enable": {
            "body": {
              "0": "<p>Are you sure you want to unarchive?</p>",
              "1": "<p>Are you sure you want to unarchive?</p>",
              "2": "<p>Are you sure you want to unarchive?</p>",
              "3": "<p>Are you sure you want to unarchive?</p>"
            },
            "title": "Unarchive <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Client",
          "create_admin": "Create Client Admin",
          "delete": "Delete Client",
          "disable": "Disable Client",
          "edit": "Edit Client",
          "enable": "Enable Client"
        }
      },
      "sidebar": {
        "copy": "Copy Client",
        "design": "Edit Design",
        "destroy": "Delete Client",
        "disable": "Disable",
        "edit": "Edit Client",
        "enable": "Enable",
        "licenses": "Manage Licenses",
        "new": "New Client",
        "title": "Campaign options"
      },
      "toggle_status": {
        "successfully": "Client Tenancy %{name} was successfully updated."
      },
      "update": {
        "successfully": "Client Tenancy %{name} was successfully updated."
      },
      "url": "Url"
    },
    "choose": " - Choose - ",
    "clear": "Clear",
    "clients": {
      "api_keys": {
        "create": {
          "successfully": "New API key was successfully created."
        },
        "index": {
          "breadcrumb": "%{name}'s API keys",
          "new": "Create new API key",
          "title": "%{name}'s API keys"
        },
        "list": {
          "active": "Active",
          "created_at": "Created",
          "key": "Key",
          "token": "Token",
          "updated_at": "Last modified"
        },
        "resource": {
          "confirmations": {
            "create": {
              "body": "<p>Are you sure you want to create a new API key?</p>\n",
              "title": "<strong>Create</strong> a new API key?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this API key?</p>\n",
              "title": "<strong>%{status}</strong> API key?"
            }
          },
          "copy": "Copy",
          "show_and_copy": "Show and Copy"
        },
        "toggle_status": {
          "successfully": "API key was successfully updated."
        }
      },
      "assessments": {
        "assigns": {
          "form": {
            "empty_client_ids": "Select clients to continue"
          }
        },
        "copy": {
          "error": "Assessment #%{name} was not copied.",
          "successfully": "Assessment %{name} was Copied Successfully."
        },
        "create": {
          "successfully": "Assessment %{name} was Created Successfully."
        },
        "dashboard": "Assessment Dashboard",
        "destroy": {
          "successfully": "Assessment %{name} was Destroyed Successfully."
        },
        "edit": {
          "header": "Assessment Settings"
        },
        "form": {
          "categories": {
            "360": "360 Feedback",
            "all": "All Categories",
            "case_study": "Case Studies",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          },
          "timing": {
            "hint": "For Example: 30 minutes to complete"
          }
        },
        "index": {
          "filterrific": {
            "with_category": {
              "360": "360 Feedback",
              "all": "All Categories",
              "case_study": "Case Studies",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "new": "Add",
          "owner": "Owner",
          "title": "Assessments",
          "tooltips": {
            "create": "Create"
          }
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New assessment"
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
              "title": "Delete <strong>Assessment</strong> ?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "export_results": "Export results",
          "normed_results": "Normed results",
          "raw_results": "Raw results",
          "scoring_results": "Scoring results",
          "tooltips": {
            "copy": "Copy Assessment",
            "delete": "Delete Assessment",
            "edit": "Edit Assessment"
          }
        },
        "sidebar": {
          "assign": "Assign Assessment",
          "builder": "Questions Builder",
          "copy": "Copy Assessment",
          "destroy": "Delete Assessment",
          "disable": "Disable",
          "edit": "Assessment Settings",
          "enable": "Enable",
          "export": "Export Scoring",
          "new": "New Assessment",
          "preview": "Preview Assessment",
          "title": "Assessment's options"
        },
        "toggle_status": {
          "successfully": "Assessment %{name} was Updated Successfully."
        },
        "update": {
          "successfully": "Assessment %{name} was Updated Successfully."
        }
      },
      "assign_assessments": {
        "confirm_remove_dependent_reports": {
          "body": "Removing assessment(s) will also remove the following reports: %{report_names}",
          "title": "Are you sure want to remove <b>Assessments</b>?"
        },
        "edit": {
          "header": "Manage assigned Assessments"
        },
        "form": {
          "apply_to_existing_users_hint": "(If is not selected, changes will be applied only to new users)"
        },
        "form_edit": {
          "apply_to_existing_users_hint": "(If is not selected, changes will be applied only to new users)",
          "name": "Assessment name",
          "remove": "Remove"
        },
        "new": {
          "header": "Add Assessments"
        }
      },
      "assign_reports": {
        "edit": {
          "header": "Add Reports"
        },
        "form": {
          "access": "Access",
          "apply_to_existing_users_hint": "(If is not selected, changes will be applied only to new users)",
          "reports": "Reports",
          "user_access": "User Access"
        },
        "form_edit": {
          "access": "Access",
          "added_reports": "Already assigned Reports",
          "apply_to_existing_users_hint": "(If is not selected, changes will be applied only to new users)",
          "new_reports": "Add new Reports",
          "remove": "Remove",
          "reports": "Reports",
          "user_access": "User Access"
        },
        "new": {
          "header": "Add Reports"
        }
      },
      "base": {
        "active": "Active",
        "archived": "Archived",
        "disable": "Archive",
        "enable": "Unarchive"
      },
      "campaigns": {
        "archive": {
          "successfully": "Campaign %{name} was successfully archived."
        },
        "copy": {
          "error": "Campaign %{name} was not copied.",
          "successfully": "Campaign %{name} was successfully copied."
        },
        "create": {
          "successfully": "Campaign %{name} was successfully created."
        },
        "destroy": {
          "successfully": "Campaign %{name} was successfully deleted."
        },
        "edit": {
          "header": "Edit Campaign"
        },
        "export": {
          "assigned_user": "Assigned Users",
          "completed_user": "Completed Users",
          "header": {
            "actions": "Actions",
            "actual_usage": "Actual Usage",
            "campaigns": "Campaigns",
            "name": "Name",
            "sub_campaign": "Sub-Campaigns",
            "tests_allocated": "Tests Allocated",
            "users": "Users"
          },
          "name": "Campaign Name"
        },
        "index": {
          "export": "Export",
          "new": "Add",
          "title": "Campaigns"
        },
        "list": {
          "assigned_user": "Assigned Users",
          "completed_user": "Completed Users",
          "header": {
            "actions": "Actions",
            "actual_usage": "Actual Usage",
            "campaigns": "Campaigns",
            "name": "Name",
            "sub_campaign": "Sub-Campaigns",
            "tests_allocated": "Tests Allocated",
            "users": "Users"
          },
          "name": "Campaign Name"
        },
        "new": {
          "header": "New Campaign"
        },
        "resource": {
          "sub_campaign": {
            "create": "Create New Sub-Campaign"
          },
          "tooltips": {
            "copy": "Copy Campaign",
            "create_report": "Add New Report",
            "create_user": "Add New User",
            "delete": "Delete Campaign",
            "edit": "Edit Campaign",
            "export": "Export"
          }
        },
        "sidebar": {
          "archive": "Archive Campaign",
          "copy": "Copy Campaign",
          "destroy": "Delete Campaign",
          "disable": "Disable",
          "edit": "Edit Campaign",
          "enable": "Enable",
          "new": "New Campaign",
          "title": "Campaign's options"
        },
        "toggle_status": {
          "successfully": "Campaign %{name} was successfully updated."
        },
        "update": {
          "successfully": "Campaign %{name} was successfully updated."
        }
      },
      "client_admins": {
        "create": {
          "successfully": "User %{name} was successfully created."
        },
        "destroy": {
          "successfully": "User %{name} was successfully deleted."
        },
        "edit": {
          "add": "Add",
          "grants": "Privileges",
          "hris_data": "HRIS Data",
          "key": "Key",
          "personal_data": "Personal Data",
          "remove": "Remove",
          "title": "Edit user",
          "value": "Value"
        },
        "form": {
          "choose": " - Choose - ",
          "choose_admin": "Choose Admin",
          "create_admin": "Create Admin"
        },
        "index": {
          "breadcrumb": "Client Admins",
          "title": "Client Admins"
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New user"
        },
        "reset_password": {
          "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
        },
        "resource": {
          "confirmations": {
            "change_password": {
              "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
              "title": "Change password <strong>%{name}</strong> ?"
            },
            "delete": {
              "body": "<p>Are you sure you want to delete this User?</p>\n",
              "title": "Delete <strong>%{name}</strong> ?"
            },
            "membership": {
              "delete": {
                "body": "<p>Are you sure you want to delete?</p>\n",
                "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
              }
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this User?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "change_password": "Change Password",
            "chart": "View user report",
            "delete": "Delete User",
            "edit": "Edit User",
            "mail": "Send Mail",
            "sign_in": "Login as user"
          }
        },
        "sidebar": {
          "api_keys": "API keys",
          "assessments_and_reports": "Assessments and Reporting",
          "destroy": "Delete User",
          "disable": "Disable",
          "edit_user": "Edit User",
          "email": "Send Mail",
          "enable": "Enable",
          "export_users": "Export users",
          "import_users": "Import users",
          "login_as_user": "Login as User",
          "new_user": "New User",
          "reset_password": "Change Password",
          "title": "User's options"
        },
        "spoof": {
          "successfully": "You was successfully login as %{name}"
        },
        "toggle_status": {
          "successfully": "User %{name} was successfully updated."
        },
        "update": {
          "successfully": "User %{name} was successfully updated."
        }
      },
      "copy": {
        "error": "Client Tenancy %{name} was not copied.",
        "successfully": "Client Tenancy %{name} was successfully copied."
      },
      "create": {
        "successfully": "Client Tenancy %{name} was successfully created."
      },
      "datasheet_rows": {
        "create": {
          "successfully": "New Datasheet was successfully uploaded."
        },
        "destroy": {
          "successfully": "Datasheet Row %{name} was successfully deleted."
        },
        "index": {
          "new": "Upload datasheet",
          "title": "%{name} Datasheet"
        },
        "list": null,
        "new": {
          "header": "Upload datasheet"
        },
        "resource": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Datasheet Row?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "tooltips": {
            "delete": "Delete"
          }
        }
      },
      "designs": {
        "form": {
          "no_background": "No Background yet",
          "no_logo": "No Logo yet"
        }
      },
      "destroy": {
        "successfully": "Client Tenancy %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Client"
      },
      "export": {
        "admin": "Client Admin",
        "client_admins": "Client Admins",
        "report_bundle": "Report Bundle"
      },
      "index": {
        "export": "Export",
        "new": "Add",
        "title": "Client Tenancies"
      },
      "license": {
        "header": "%{name} - Edit license"
      },
      "license_usages": {
        "index": {
          "title": "Usage Details"
        },
        "list": {
          "campaign_name": "Campaign Name",
          "created_at": "Date",
          "id": "Usage ID",
          "subject_email": "Subject Email",
          "subject_name": "Subject Name"
        }
      },
      "licenses": {
        "create": {
          "successfully": "License was successfully created."
        },
        "edit": {
          "header": "Edit License"
        },
        "form": {
          "add_license": "Add Another License",
          "license_number": "License Number",
          "license_overuse_number": "Over Use Allowance",
          "report_family": "Report Bundle"
        },
        "index": {
          "new": "Add License",
          "report_family": "Report Bundle",
          "title": "%{client_name} - Manage Licenses"
        },
        "list": {
          "date_expire": "Date Of Expiry: %{date}",
          "end_date": "End Date",
          "header": "%{client_name} - Licenses Usage",
          "license_has_expired": "License package has expired",
          "license_type": "License Type",
          "report_family": "Report Bundle",
          "start_date": "Start Date",
          "usage_percent": "% of Usage",
          "used_license_number": "Used Licenses",
          "used_license_overuse_number": "Over Use Allowance",
          "used_out_of": "%{used_number} out of %{number}"
        },
        "mailer": {
          "license_expire": {
            "subject": "License expired"
          },
          "license_overuse": {
            "subject": "License overuse"
          }
        },
        "new": {
          "header": "Add License"
        },
        "overview": {
          "date_expire": "Date Of Expiry: %{date}",
          "end_date": "End Date",
          "header": "%{client_name} - Licenses Usage",
          "license_has_expired": "License package has expired",
          "license_type": "License Type",
          "report_family": "Report Bundle",
          "start_date": "Start Date",
          "usage_percent": "% of Usage",
          "used_license_number": "Used Licenses",
          "used_license_overuse_number": "Over Use Allowance",
          "used_out_of": "%{used_number} out of %{number}"
        },
        "resource": {
          "confirmations": {
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this License?</p>\n",
              "title": "<strong>%{status}</strong> License for %{name}?"
            }
          },
          "tooltips": {
            "edit": "Edit License"
          }
        },
        "show": {
          "date_expire": "Date Of Expiry: %{date}",
          "end_date": "End Date",
          "header": "%{client_name} - Licenses Usage",
          "license_has_expired": "License package has expired",
          "license_type": "License Type",
          "report_family": "Report Bundle",
          "start_date": "Start Date",
          "usage_percent": "% of Usage",
          "used_license_number": "Used Licenses",
          "used_license_overuse_number": "Over Use Allowance",
          "used_out_of": "%{used_number} out of %{number}"
        },
        "toggle_status": {
          "successfully": "Status of License was successfully updated."
        },
        "update": {
          "duplicate_licenses": "You have duplicate licenses",
          "successfully": "Licenses successfully updated"
        }
      },
      "list": {
        "admin": "Client Admin",
        "client_admins": "Client Admins",
        "report_bundle": "Report Bundle"
      },
      "new": {
        "header": "New Client"
      },
      "project_admins": {
        "create": {
          "successfully": "User %{name} was successfully created."
        },
        "destroy": {
          "successfully": "User %{name} was successfully deleted."
        },
        "edit": {
          "add": "Add",
          "grants": "Privileges",
          "hris_data": "HRIS Data",
          "key": "Key",
          "personal_data": "Personal Data",
          "remove": "Remove",
          "title": "Edit user",
          "value": "Value"
        },
        "form": {
          "choose": " - Choose - ",
          "choose_admin": "Choose Admin",
          "create_admin": "Create Admin"
        },
        "index": {
          "breadcrumb": "Project Admins",
          "title": "Project Admins"
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New user"
        },
        "reset_password": {
          "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
        },
        "resource": {
          "confirmations": {
            "change_password": {
              "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
              "title": "Change password <strong>%{name}</strong> ?"
            },
            "delete": {
              "body": "<p>Are you sure you want to delete this User?</p>\n",
              "title": "Delete <strong>%{name}</strong> ?"
            },
            "membership": {
              "delete": {
                "body": "<p>Are you sure you want to delete?</p>\n",
                "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
              }
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this User?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "change_password": "Change Password",
            "chart": "View user report",
            "delete": "Delete User",
            "edit": "Edit User",
            "mail": "Send Mail",
            "sign_in": "Login as user"
          }
        },
        "sidebar": {
          "api_keys": "API keys",
          "assessments_and_reports": "Assessments and Reporting",
          "destroy": "Delete User",
          "disable": "Disable",
          "edit_user": "Edit User",
          "email": "Send Mail",
          "enable": "Enable",
          "export_users": "Export users",
          "import_users": "Import users",
          "login_as_user": "Login as User",
          "new_user": "New User",
          "reset_password": "Change Password",
          "title": "User's options"
        },
        "spoof": {
          "successfully": "You was successfully login as %{name}"
        },
        "toggle_status": {
          "successfully": "User %{name} was successfully updated."
        },
        "update": {
          "successfully": "User %{name} was successfully updated."
        }
      },
      "projects": {
        "archive": {
          "successfully": "Project %{name} was successfully archived."
        },
        "assign_assessments": {
          "add_assessment": "Add Assessment",
          "assessments": "Assessments"
        },
        "assign_reports": {
          "add_report": "Add Report"
        },
        "campaigns": {
          "archive": {
            "successfully": "Campaign %{name} was successfully archived."
          },
          "copy": {
            "error": "Campaign %{name} was not copied.",
            "successfully": "Campaign %{name} was successfully copied."
          },
          "create": {
            "successfully": "Campaign %{name} was successfully created."
          },
          "destroy": {
            "successfully": "Campaign %{name} was successfully deleted."
          },
          "edit": {
            "header": "Edit Campaign"
          },
          "export": {
            "assigned_user": "Assigned Users",
            "completed_user": "Completed Users",
            "header": {
              "actions": "Actions",
              "actual_usage": "Actual Usage",
              "campaigns": "Campaigns",
              "name": "Name",
              "sub_campaign": "Sub-Campaigns",
              "tests_allocated": "Tests Allocated",
              "users": "Users"
            },
            "name": "Campaign Name"
          },
          "index": {
            "export": "Export",
            "new": "Add",
            "title": "Campaigns"
          },
          "list": {
            "assigned_user": "Assigned Users",
            "completed_user": "Completed Users",
            "header": {
              "actions": "Actions",
              "actual_usage": "Actual Usage",
              "campaigns": "Campaigns",
              "name": "Name",
              "sub_campaign": "Sub-Campaigns",
              "tests_allocated": "Tests Allocated",
              "users": "Users"
            },
            "name": "Campaign Name"
          },
          "new": {
            "header": "New Campaign"
          },
          "resource": {
            "sub_campaign": {
              "create": "Create New Sub-Campaign"
            },
            "tooltips": {
              "copy": "Copy Campaign",
              "create_report": "Add New Report",
              "create_user": "Add New User",
              "delete": "Delete Campaign",
              "edit": "Edit Campaign",
              "export": "Export"
            }
          },
          "sidebar": {
            "archive": "Archive Campaign",
            "copy": "Copy Campaign",
            "destroy": "Delete Campaign",
            "disable": "Disable",
            "edit": "Edit Campaign",
            "enable": "Enable",
            "new": "New Campaign",
            "title": "Campaign's options"
          },
          "sub_campaigns": {
            "archive": {
              "successfully": "Sub-Campaign %{name} was successfully archived."
            },
            "copy": {
              "error": "Sub-Campaign %{name} was not copied.",
              "successfully": "Sub-Campaign %{name} was successfully copied."
            },
            "create": {
              "successfully": "Sub-Campaign %{name} was successfully created."
            },
            "destroy": {
              "successfully": "Sub-Campaign %{name} was successfully deleted."
            },
            "edit": {
              "header": "Edit Sub-Campaign"
            },
            "export": {
              "assigned_user": "Assigned Users",
              "completed_user": "Completed Users",
              "header": {
                "actions": "Actions",
                "actual_usage": "Actual Usage",
                "archive_status": "Archive Status",
                "name": "Name",
                "sub_campaign": "Sub-Campaigns",
                "tests_allocated": "Tests Allocated",
                "users": "Users"
              },
              "name": "Sub-Campaign Name"
            },
            "header": {
              "actions": "Actions"
            },
            "index": {
              "export": "Export",
              "new": "Add",
              "title": "Sub Campaigns"
            },
            "list": {
              "assigned_user": "Assigned Users",
              "completed_user": "Completed Users",
              "header": {
                "actions": "Actions",
                "actual_usage": "Actual Usage",
                "archive_status": "Archive Status",
                "name": "Name",
                "sub_campaign": "Sub-Campaigns",
                "tests_allocated": "Tests Allocated",
                "users": "Users"
              },
              "name": "Sub-Campaign Name"
            },
            "new": {
              "header": "New Sub-Campaign"
            },
            "resource": {
              "tooltips": {
                "copy": "Copy Sub Campaign",
                "create_report": "Add new Report",
                "create_user": "Add New User",
                "delete": "Delete Sub Campaign",
                "edit": "Edit Sub Campaign"
              }
            },
            "sidebar": {
              "archive": "Archive Sub-Campaign",
              "copy": "Copy Sub-Campaign",
              "destroy": "Delete Sub-Campaign",
              "disable": "Disable",
              "edit": "Edit Sub-Campaign",
              "enable": "Enable",
              "new": "New Sub-Campaign",
              "title": "Sub-Campaign's options"
            },
            "toggle_status": {
              "successfully": "Sub-Campaign %{name} was successfully updated."
            },
            "update": {
              "successfully": "Sub-Campaign %{name} was successfully updated."
            }
          },
          "toggle_status": {
            "successfully": "Campaign %{name} was successfully updated."
          },
          "update": {
            "successfully": "Campaign %{name} was successfully updated."
          }
        },
        "copy": {
          "error": "Project %{name} was not copied.",
          "successfully": "Project %{name} was successfully copied."
        },
        "create": {
          "successfully": "Project %{name} was successfully created."
        },
        "destroy": {
          "successfully": "Project %{name} was successfully deleted."
        },
        "edit": {
          "header": "Edit Project"
        },
        "export": {
          "actual_usage": "Actual Usage",
          "admin": "Client Admin",
          "applicable_level": "Applicable Level",
          "archive_status": "Status",
          "assessments": "Assessments",
          "assigned_user": "Assigned Users",
          "completed_user": "Completed users",
          "created_at": "Created Date",
          "name": "Project name",
          "project_admin": "Project Admins",
          "reports": "Reports",
          "tests_allocated": "Tests Allocated",
          "tte_admin": "TTE Project Manager",
          "updated_at": "Modified Date",
          "url": "URL",
          "users_count": "Users Count"
        },
        "form": {
          "applicable_levels": {
            "campaign": "Campaign End Level",
            "project": "Project End Level",
            "sub_campaign": "Sub-Campaign End Level"
          },
          "data_privacy": "Data privacy",
          "project_number": "Project Number"
        },
        "header": {
          "actions": "Actions"
        },
        "index": {
          "export": "Export",
          "new": "Add",
          "title": "Projects",
          "tooltips": {
            "create": "Create",
            "export": "Export"
          }
        },
        "list": {
          "actual_usage": "Actual Usage",
          "admin": "Client Admin",
          "applicable_level": "Applicable Level",
          "archive_status": "Status",
          "assessments": "Assessments",
          "assigned_user": "Assigned Users",
          "completed_user": "Completed users",
          "created_at": "Created Date",
          "name": "Project name",
          "project_admin": "Project Admins",
          "reports": "Reports",
          "tests_allocated": "Tests Allocated",
          "tte_admin": "TTE Project Manager",
          "updated_at": "Modified Date",
          "url": "URL",
          "users_count": "Users Count"
        },
        "new": {
          "header": "New Project"
        },
        "resource": {
          "add_assessment": "Add Assessment",
          "add_report": "Add Report",
          "assessments": "Assessments",
          "tooltips": {
            "copy": "Copy Project",
            "create_admin": "Create Project Admin",
            "create_report": "Add New Report",
            "create_user": "Add New User",
            "delete": "Delete Project",
            "edit": "Edit Project"
          }
        },
        "sidebar": {
          "admins": "Admin Users",
          "archive": "Archive Project",
          "copy": "Copy Project",
          "design": "Edit Design",
          "destroy": "Delete Project",
          "disable": "Disable",
          "edit": "Edit Project",
          "enable": "Enable",
          "new": "New Project",
          "title": "Project's options",
          "view_licenses": "View Licenses"
        },
        "threesixty_campaigns": {
          "base": {
            "active": "Active",
            "archived": "Archived",
            "disable": "Archive",
            "enable": "Unarchive"
          },
          "completion_statuses": {
            "approved": "Approved",
            "completed": "Completed",
            "denied": "Denied",
            "in_progress": "In Progress",
            "not_started": "Not Started"
          },
          "copy": {
            "error": "Client Tenancy %{name} was not copied.",
            "successfully": "Client Tenancy %{name} was successfully copied."
          },
          "create": {
            "successfully": "Client Tenancy %{name} was successfully created."
          },
          "designs": {
            "form": {
              "no_background": "No Background yet",
              "no_logo": "No Logo yet"
            }
          },
          "destroy": {
            "successfully": "Client Tenancy %{name} was successfully deleted."
          },
          "edit": {
            "header": "Edit 360 Campaign"
          },
          "export": {
            "admin": "Client Admin",
            "client_admins": "Client Admins",
            "report_bundle": "Report Bundle"
          },
          "index": {
            "export": "Export",
            "new": "Add 360 Campaign",
            "title": "360 Campaigns"
          },
          "license": {
            "header": "%{name} - Edit license"
          },
          "licenses": {
            "update": {
              "duplicate_licenses": "You have duplicate licenses",
              "successfully": "Licenses successfully updated"
            }
          },
          "list": {
            "admin": "Client Admin",
            "client_admins": "Client Admins",
            "report_bundle": "Report Bundle"
          },
          "new": {
            "header": "New 360 Campaign"
          },
          "resource": {
            "confirmations": {
              "delete": {
                "body": {
                  "0": "<p>Are you sure you want to delete?</p> <p>All Campaigns, Sub-campaigns and users will also be deleted</p>",
                  "1": "<p>Are you sure you want to delete?</p> <p>All Sub-campaigns and users will also be deleted</p>",
                  "2": "<p>Are you sure you want to delete?</p> <p>All users will also be deleted</p>"
                },
                "title": "Delete <strong>%{name}</strong> ?"
              },
              "disable": {
                "body": {
                  "0": "<p>Are you sure you want to archive?</p> <p>All Campaigns, Sub-campaigns and users will also be archived</p>",
                  "1": "<p>Are you sure you want to archive?</p> <p>All Sub-campaigns and users will also be archived</p>",
                  "2": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>",
                  "3": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>"
                },
                "title": "Archive <strong>%{name}</strong> ?"
              },
              "enable": {
                "body": {
                  "0": "<p>Are you sure you want to unarchive?</p>",
                  "1": "<p>Are you sure you want to unarchive?</p>",
                  "2": "<p>Are you sure you want to unarchive?</p>",
                  "3": "<p>Are you sure you want to unarchive?</p>"
                },
                "title": "Unarchive <strong>%{name}</strong> ?"
              }
            },
            "tooltips": {
              "copy": "Copy Client",
              "create_admin": "Create Client Admin",
              "delete": "Delete Client",
              "disable": "Disable Client",
              "edit": "Edit Client",
              "enable": "Enable Client"
            }
          },
          "statistics": {
            "index": {
              "all_assessments": "All assessments",
              "assessment_type": "Assessment type",
              "title": "Statistics"
            }
          },
          "toggle_status": {
            "successfully": "Client Tenancy %{name} was successfully updated."
          },
          "update": {
            "successfully": "Client Tenancy %{name} was successfully updated."
          },
          "url": "Url"
        },
        "toggle_status": {
          "successfully": "Project %{name} was successfully updated."
        },
        "update": {
          "successfully": "Project %{name} was successfully updated."
        }
      },
      "reports": {
        "copy": {
          "error": "Report #%{id} was not copied."
        },
        "create": {
          "successfully": "Report %{name} was successfully created for Client."
        },
        "destroy": {
          "successfully": "Report %{name} was successfully deleted from Client."
        },
        "edit": {
          "header": "Edit Report Name"
        },
        "form": {
          "load_mindmill_report": "Load from Mindmill",
          "none_external": "None - Use report builder",
          "select_family": "Select Report Bundle",
          "types": {
            "common": "Any",
            "eti": "ETI",
            "yti": "YTI"
          }
        },
        "index": {
          "add": "Add",
          "bulk_download": "Bulk Download",
          "families": "Report Bundles",
          "filterrific": {
            "with_assessment_category": {
              "360": "360 Feedback",
              "all": "All",
              "case_study": "Case Studies",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "owner": "Owner",
          "regenerate": "Regenerate Reports",
          "report_family": "Report Bundle",
          "title": "Reports",
          "tooltips": {
            "create": "Create"
          }
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "Select Report"
        },
        "preview": {
          "export_pdf": "Export to PDF",
          "title": "Preview"
        },
        "regenerate": {
          "successfully": "Report successfully sent for regeneration"
        },
        "regenerates": {
          "create": {
            "successfully": "Report(s) successfully sent for regeneration"
          }
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Report?</p>\n",
              "title": "Delete <strong>Report</strong> ?"
            },
            "detach": {
              "body": "<p>Are you sure you want to detach this Report?</p>\n",
              "title": "Detach <strong>Report</strong> ?"
            },
            "regenerate": {
              "body": "<p>Are you sure you want to regenerate this Report for all Users?</p>",
              "title": "Regenerate <strong>%{name}</strong>?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "copy": "Copy Report",
            "delete": "Delete Report",
            "edit": "Edit Report",
            "preview": "Preview Report"
          }
        },
        "sidebar": {
          "copy": "Copy Report",
          "destroy": "Delete Report",
          "edit": "Edit Report",
          "regenerate": "Regenerate Report",
          "title": "Report's options",
          "view": "View Report"
        },
        "toggle_status": {
          "successfully": "Report was successfully updated."
        },
        "types": {
          "common": "Any",
          "eti": "ETI",
          "yti": "YTI"
        },
        "update": {
          "successfully": "Report %{name} was successfully updated."
        }
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": {
              "0": "<p>Are you sure you want to delete?</p> <p>All Campaigns, Sub-campaigns and users will also be deleted</p>",
              "1": "<p>Are you sure you want to delete?</p> <p>All Sub-campaigns and users will also be deleted</p>",
              "2": "<p>Are you sure you want to delete?</p> <p>All users will also be deleted</p>"
            },
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "disable": {
            "body": {
              "0": "<p>Are you sure you want to archive?</p> <p>All Campaigns, Sub-campaigns and users will also be archived</p>",
              "1": "<p>Are you sure you want to archive?</p> <p>All Sub-campaigns and users will also be archived</p>",
              "2": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>",
              "3": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>"
            },
            "title": "Archive <strong>%{name}</strong> ?"
          },
          "enable": {
            "body": {
              "0": "<p>Are you sure you want to unarchive?</p>",
              "1": "<p>Are you sure you want to unarchive?</p>",
              "2": "<p>Are you sure you want to unarchive?</p>",
              "3": "<p>Are you sure you want to unarchive?</p>"
            },
            "title": "Unarchive <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Client",
          "create_admin": "Create Client Admin",
          "delete": "Delete Client",
          "disable": "Disable Client",
          "edit": "Edit Client",
          "enable": "Enable Client"
        }
      },
      "sidebar": {
        "copy": "Copy Client",
        "design": "Edit Design",
        "destroy": "Delete Client",
        "disable": "Disable",
        "edit": "Edit Client",
        "enable": "Enable",
        "licenses": "Manage Licenses",
        "new": "New Client",
        "title": "Client's options"
      },
      "statistics": {
        "index": {
          "all_assessments": "All assessments",
          "assessment_type": "Assessment type",
          "title": "Statistics"
        }
      },
      "sub_campaigns": {
        "archive": {
          "successfully": "Sub-Campaign %{name} was successfully archived."
        },
        "copy": {
          "error": "Sub-Campaign %{name} was not copied.",
          "successfully": "Sub-Campaign %{name} was successfully copied."
        },
        "create": {
          "successfully": "Sub-Campaign %{name} was successfully created."
        },
        "destroy": {
          "successfully": "Sub-Campaign %{name} was successfully deleted."
        },
        "edit": {
          "header": "Edit Sub-Campaign"
        },
        "export": {
          "assigned_user": "Assigned Users",
          "completed_user": "Completed Users",
          "header": {
            "actions": "Actions",
            "actual_usage": "Actual Usage",
            "archive_status": "Archive Status",
            "name": "Name",
            "sub_campaign": "Sub-Campaigns",
            "tests_allocated": "Tests Allocated",
            "users": "Users"
          },
          "name": "Sub-Campaign Name"
        },
        "header": {
          "actions": "Actions"
        },
        "index": {
          "export": "Export",
          "new": "Add",
          "title": "Sub Campaigns"
        },
        "list": {
          "assigned_user": "Assigned Users",
          "completed_user": "Completed Users",
          "header": {
            "actions": "Actions",
            "actual_usage": "Actual Usage",
            "archive_status": "Archive Status",
            "name": "Name",
            "sub_campaign": "Sub-Campaigns",
            "tests_allocated": "Tests Allocated",
            "users": "Users"
          },
          "name": "Sub-Campaign Name"
        },
        "new": {
          "header": "New Sub-Campaign"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Sub Campaign",
            "create_report": "Add new Report",
            "create_user": "Add New User",
            "delete": "Delete Sub Campaign",
            "edit": "Edit Sub Campaign"
          }
        },
        "sidebar": {
          "archive": "Archive Sub-Campaign",
          "copy": "Copy Sub-Campaign",
          "destroy": "Delete Sub-Campaign",
          "disable": "Disable",
          "edit": "Edit Sub-Campaign",
          "enable": "Enable",
          "new": "New Sub-Campaign",
          "title": "Sub-Campaign's options"
        },
        "toggle_status": {
          "successfully": "Sub-Campaign %{name} was successfully updated."
        },
        "update": {
          "successfully": "Sub-Campaign %{name} was successfully updated."
        }
      },
      "toggle_status": {
        "successfully": "Client Tenancy %{name} was successfully updated."
      },
      "tooltips": {
        "copy": "Copy Campaign",
        "create_report": "Add New Report",
        "create_user": "Add New User",
        "delete": "Delete Campaign",
        "edit": "Edit Campaign",
        "export": "Export"
      },
      "update": {
        "successfully": "Client Tenancy %{name} was successfully updated."
      },
      "url": "Url",
      "users": {
        "admins": {
          "breadcrumb": "Admin Users",
          "title": "Admins"
        },
        "assigns": {
          "common": {
            "detach_assessment": "Assessment %{name} was successfully detached.",
            "detach_report": "Report %{name} was successfully detached."
          },
          "create": {
            "successfully": "Successfully Updated"
          },
          "form": {
            "assessment": "Assessment",
            "multiple_report_message": "The report has data from multiple assessments. To provide an access to the user to download the results you should assign all assessments linked to the report.",
            "user_access": {
              "access": "Reports access",
              "preserve_user_access": "Apply access settings only for the newly added report",
              "user": "User"
            }
          },
          "index": {
            "add_assessments": "Add Assessments",
            "add_reports": "Add Reports",
            "title": "%{name} - Assessments and Reporting"
          },
          "list": {
            "actions": "Actions",
            "assessment_name": "Assessment Name",
            "assessment_type": "Assessment Type",
            "completed_at": "Completed at",
            "reports": "Reports",
            "status": "Status",
            "uniq_id": "Uniq ID"
          },
          "new": {
            "header": "Assign Assessment and Reports"
          },
          "reset": {
            "successfully": "Result data was successfully reseted"
          },
          "resource": {
            "confirms": {
              "assigns_report": {
                "add_user_access": {
                  "body": "<p>Are you sure you want to add user access to this report?</p>",
                  "title": "Add user access to <strong>%{name}</strong> ?"
                },
                "delete": {
                  "body": "<p>Are you sure you want to detach this report?</p>",
                  "title": "Detach <strong>%{name}</strong> ?"
                },
                "regenerate": {
                  "body": "<p>Are you sure you want to regenerate this report?</p>",
                  "title": "Regenerate <strong>%{name}</strong> ?"
                },
                "remove_user_access": {
                  "body": "<p>Are you sure you want to remove user access to this report?</p>",
                  "title": "Remove user access to <strong>%{name}</strong> ?"
                }
              },
              "reset": {
                "body": "<p>Are you sure you want to reset result?</p>",
                "title": "Reset <strong>Result</strong> ?"
              }
            },
            "generating": "Report \"%{name}\" is generating",
            "no_access_to_reports": "No access to reports",
            "no_reports": "No relative reports",
            "not_completed": "Not completed",
            "tooltips": {
              "assigns_report": {
                "add_user_access": "Add user access",
                "delete": "Detach Report",
                "regenerate": "Regenerate report file",
                "remove_user_access": "Remove user access"
              },
              "delete": "Detach Assessment",
              "reset": "Reset result"
            }
          }
        },
        "assigns_reports": {
          "edit": {
            "header": "Add Reports"
          },
          "form": {
            "assessment": "Assessment",
            "detach": "Detach",
            "multiple_report_message": "The report has data from multiple assessments. To provide an access to the user to download the results you should assign all assessments linked to the report.",
            "user_access": {
              "access": "Reports access",
              "user": "User"
            }
          },
          "new": {
            "header": "Add Reports"
          },
          "regenerate": {
            "successfully": "Successfully sent to regenerate"
          },
          "update": {
            "successfully": "Successfully Updated"
          }
        },
        "create": {
          "successfully": "User %{name} was successfully created."
        },
        "destroy": {
          "successfully": "User %{name} was successfully deleted."
        },
        "edit": {
          "add": "Add",
          "grants": "Privileges",
          "hris_data": "HRIS Data",
          "key": "Key",
          "personal_data": "Personal Data",
          "remove": "Remove",
          "title": "Edit user",
          "value": "Value"
        },
        "form": {
          "choose": " - Choose - "
        },
        "form_admin": {
          "choose_admin": "Choose Admin",
          "create_admin": "Create Admin"
        },
        "index": {
          "breadcrumb": "Users",
          "export": "Export",
          "export_completion_status": "Completion Status",
          "export_users": "Users",
          "filterrific": {
            "with_role": {
              "administration": "Administrators",
              "all": "All",
              "users": "Users"
            }
          },
          "import": "Import",
          "import_hris": "HRIS Data",
          "import_users": "Users",
          "new": "Add",
          "new_superadmin": "Add SuperAdmin",
          "title": "Users",
          "tooltips": {
            "create": "Create",
            "export": "Export",
            "import": "Import"
          }
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New user"
        },
        "reports": {
          "copy": {
            "error": "Report #%{id} was not copied."
          },
          "create": {
            "successfully": "Report %{name} was successfully created."
          },
          "destroy": {
            "successfully": "Report %{name} was successfully deleted."
          },
          "edit": {
            "header": "Edit Report Name"
          },
          "form": {
            "load_mindmill_report": "Load from Mindmill",
            "none_external": "None - Use report builder",
            "select_family": "Select Report Bundle",
            "types": {
              "common": "Any",
              "eti": "ETI",
              "yti": "YTI"
            }
          },
          "index": {
            "add": "Add",
            "bulk_download": "Bulk Download",
            "families": "Report Bundles",
            "filterrific": {
              "with_assessment_category": {
                "360": "360 Feedback",
                "all": "All",
                "case_study": "Case Studies",
                "organisational": "Org Surveys",
                "psychometric": "Psychometrics"
              }
            },
            "owner": "Owner",
            "regenerate": "Regenerate Reports",
            "report_family": "Report Bundle",
            "title": "Reports",
            "tooltips": {
              "create": "Create"
            }
          },
          "list": {
            "created_at": "Created Date",
            "updated_at": "Modified Date"
          },
          "new": {
            "header": "Select Report"
          },
          "preview": {
            "export_pdf": "Export to PDF",
            "title": "Preview"
          },
          "regenerate": {
            "successfully": "Report successfully sent for regeneration"
          },
          "resource": {
            "confirmations": {
              "delete": {
                "body": "<p>Are you sure you want to delete this Report?</p>\n",
                "title": "Delete <strong>Report</strong> ?"
              },
              "detach": {
                "body": "<p>Are you sure you want to detach this Report?</p>\n",
                "title": "Detach <strong>Report</strong> ?"
              },
              "regenerate": {
                "body": "<p>Are you sure you want to regenerate this Report for all Users?</p>",
                "title": "Regenerate <strong>%{name}</strong>?"
              },
              "toggle_status": {
                "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
                "title": "<strong>%{status}</strong> %{name}?"
              }
            },
            "tooltips": {
              "copy": "Copy Report",
              "delete": "Delete Report",
              "edit": "Edit Report",
              "preview": "Preview Report"
            }
          },
          "sidebar": {
            "copy": "Copy Report",
            "destroy": "Delete Report",
            "edit": "Edit Report",
            "regenerate": "Regenerate Report",
            "title": "Report's options",
            "view": "View Report"
          },
          "toggle_status": {
            "successfully": "Report was successfully updated."
          },
          "types": {
            "common": "Any",
            "eti": "ETI",
            "yti": "YTI"
          },
          "update": {
            "successfully": "Report %{name} was successfully updated."
          }
        },
        "reset_password": {
          "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
        },
        "resource": {
          "confirmations": {
            "change_password": {
              "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
              "title": "Change password <strong>%{name}</strong> ?"
            },
            "delete": {
              "body": "<p>Are you sure you want to delete this User?</p>\n",
              "title": "Delete <strong>%{name}</strong> ?"
            },
            "membership": {
              "delete": {
                "body": "<p>Are you sure you want to delete?</p>\n",
                "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
              }
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this User?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "change_password": "Change Password",
            "chart": "View user report",
            "delete": "Delete User",
            "edit": "Edit User",
            "mail": "Send Mail",
            "sign_in": "Login as user"
          }
        },
        "sidebar": {
          "api_keys": "API keys",
          "assessments_and_reports": "Assessments and Reporting",
          "destroy": "Delete User",
          "disable": "Disable",
          "edit_user": "Edit User",
          "email": "Send Mail",
          "enable": "Enable",
          "export_users": "Export users",
          "import_users": "Import users",
          "login_as_user": "Login as User",
          "new_user": "New User",
          "reset_password": "Change Password",
          "title": "User's options"
        },
        "spoof": {
          "successfully": "You was successfully login as %{name}"
        },
        "toggle_status": {
          "successfully": "User %{name} was successfully updated."
        },
        "update": {
          "successfully": "User %{name} was successfully updated."
        }
      }
    },
    "clients_hierarchy": "Project > Campaign > Sub Campaign",
    "close": "Close",
    "communications": {
      "copy": {
        "error": "Communication #%{id} was not copied."
      },
      "create": {
        "successfully": "Communication created successfully."
      },
      "destroy": {
        "successfully": "Communication %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Communication"
      },
      "form": {
        "body_mustache": "{{{user_link}}} - Link to the Platform for existing users or a one time only link to set a password for new users\n{{first_name}} - Recipient First Name\n{{last_name}} - Recipient Last Name\n{{email}} - Recipient Email\n",
        "delivery_at": "Delivery at (GST)",
        "delivery_rules": {
          "in_progress": "If assessment is in progress",
          "not_competed": "If assessment is not completed",
          "not_started": "If assessment is not started",
          "send_now": "Send now",
          "specific_datetime": "Send at"
        },
        "kind": "Communication Types",
        "selected_cc_recipients": "Selected CC Recipients",
        "selected_recipients": "Selected Recipients",
        "stop_reminder": "Stop sending reminders",
        "stop_reminder_datetime": "End date for reminders (GST)"
      },
      "index": {
        "clients": "Clients",
        "completion": "Completion",
        "invitation": "Invitation",
        "new": "Add",
        "other": "Other",
        "owner": "Owner",
        "reminder": "Reminder",
        "title": "Communication Center",
        "tooltips": {
          "create": "Create"
        },
        "type": "Type"
      },
      "list": {
        "actions": "Actions",
        "author": "Created by",
        "campaign": "Campaign",
        "client_name": "Client",
        "created_at": "Created Date",
        "creator_first_name": "Created by",
        "delivery_rule": "Delivery",
        "kind": "Communication type",
        "project": "Project",
        "recipients": "Recipients",
        "sub_campaign": "Sub-campaign",
        "subject": "Communication subject",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New Communication"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Communication?</p>\n",
            "title": "Delete <strong>Communication</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Communication?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Communication",
          "delete": "Delete Communication",
          "download": "Download Communication History",
          "edit": "Edit Communication",
          "view": "View Communication"
        }
      },
      "show": {
        "assessment": "Assessment:",
        "back": "Back",
        "body": "Body:",
        "campaign": "Campaign:",
        "client": "Client:",
        "communication_type": "Communication type:",
        "delivery_interval": "Delivery interval:",
        "delivery_rule": "Delivery rule:",
        "every_interval": "Every %{interval}",
        "owner": "Owner:",
        "project": "Project:",
        "recipients": "Recipients:",
        "specific_datetime": "Send at:",
        "stop_reminder_datetime": "End date for reminders (GST)",
        "sub_campaign": "Sub Campaign:",
        "subject": "Subject:",
        "users": "Users:"
      },
      "sidebar": {
        "copy": "Copy Communication",
        "destroy": "Delete Communication",
        "download": "Download Communication History",
        "edit": "Edit Communication",
        "new": "New Communication",
        "title": "Communication's options",
        "view": "View Communication"
      },
      "toggle_status": {
        "successfully": "Communication was successfully updated."
      }
    },
    "copy": "Copy",
    "create": "Create",
    "created": "Successfully created",
    "created_by": "Created By",
    "dimensions": {
      "copy": {
        "error": "Dimension #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Dimension %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Dimension Name"
      },
      "index": {
        "new": "Add",
        "owner": "Owner",
        "title": "Dimensions",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New Dimension"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Dimension?</p>\n",
            "title": "Delete <strong>Dimension</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Dimension?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Dimension",
          "delete": "Delete Dimension",
          "edit": "Edit Dimension Name"
        }
      },
      "sidebar": {
        "assign": "Assign Dimension",
        "copy": "Copy Dimension",
        "destroy": "Delete Dimension",
        "disable": "Disable Dimension",
        "edit": "Edit Dimension Name",
        "enable": "Enable Dimension",
        "new": "New Dimension",
        "title": "Dimension's options",
        "view": "View Dimension"
      },
      "toggle_status": {
        "successfully": "Dimension was successfully updated."
      }
    },
    "disable": "Disable",
    "edit": "Edit",
    "enable": "Enable",
    "factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Factor Name"
      },
      "form": {
        "no_icon": "No Logo yet"
      },
      "index": {
        "icon": "Icon",
        "new": "Add",
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Factor?</p>\n",
            "title": "Delete <strong>Factor</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Factor?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Factor",
          "delete": "Delete Factor",
          "edit": "Edit Factor"
        }
      },
      "sidebar": {
        "copy": "Copy Factor",
        "destroy": "Delete Factor",
        "edit": "Edit Factor",
        "title": "Factor's options",
        "view": "View Factor"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "genders": {
      "female": "Female",
      "male": "Male",
      "not_set": "Not set"
    },
    "hide": "Hide",
    "home": {
      "index": {
        "notifications": "Notifications"
      }
    },
    "import": "Import",
    "imports": {
      "assessments": {
        "results": {
          "existing_users_whose_password_not_changed_modal_dialog": {
            "header": "The list of users whose passwords will be not changed"
          },
          "form": {
            "description": "Refer to the Export functionality to extract a template that can be used to Import here.",
            "import": "Import"
          }
        }
      },
      "base": {
        "form": {
          "import": "Import"
        }
      },
      "errors": {
        "error": "[Row %{row}] %{error}",
        "invalid_assign": "Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
        "invalid_format": "There is no Email column",
        "norm": {
          "factor_is_not_described": "[#%{coords}] factor %{factor} is not described above",
          "factors_mismatch": "[#%{coords}] dimension %{dimension} does not have factor %{factor}",
          "not_set_dimension": "The name of the Dimension should be written in A-1",
          "sub_factors_mismatch": "[#%{coords}] dimension %{dimension} does not have sub factor %{factor}"
        },
        "result": {
          "error": "[Row %{row}] %{error}",
          "invalid_assign": "[Row %{row}] Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
          "invalid_format": "Invalid File format"
        },
        "translation": {
          "error": "[Translation %{id}] %{error}",
          "invalid_format": "Invalid File format"
        },
        "unknown_type": "Unknown file type: %{filename}",
        "user": {
          "not_found": "[Row %{row}] Couldn't find User with Email Address %{email}"
        }
      },
      "form": {
        "description": "Refer to the Export functionality to extract a template that can be used to Import here.",
        "import": "Import"
      },
      "hris": {
        "existing_users_whose_password_not_changed_modal_dialog": {
          "header": "The list of users whose passwords will be not changed"
        },
        "form": {
          "description": "Refer to the Export functionality to extract a template that can be used to Import here.",
          "import": "Import"
        }
      },
      "new": {
        "header": "Import"
      },
      "users": {
        "existing_users_whose_password_not_changed_modal_dialog": {
          "header": "The list of users whose passwords will be not changed"
        },
        "form": {
          "description": "Refer to the Export functionality to extract a template that can be used to Import here.",
          "import": "Import"
        }
      }
    },
    "imports_assessments_result_imports": {
      "create": {
        "successfully": "Raw Results data was successfully imported"
      },
      "modal": {
        "header": {
          "raw": "Import Raw Results data",
          "scoring": "Import Scoring Results data"
        }
      }
    },
    "imports_hris_imports": {
      "create": {
        "successfully": "HRIS data was successfully imported"
      },
      "new": {
        "header": "Import HRIS data"
      }
    },
    "imports_user_imports": {
      "create": {
        "successfully": "Users was successfully imported"
      },
      "new": {
        "header": "Import Users"
      }
    },
    "libraries": {
      "create": {
        "successfully": "Item %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Item %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit"
      },
      "index": {
        "new_folder": "New Folder",
        "owner": "Owner",
        "title": "Media Library",
        "upload": "Upload"
      },
      "list": {
        "created_at": "Created Date",
        "new_folder": "New folder",
        "root": "Media Library",
        "updated_at": "Modified Date",
        "upload": "Upload new file"
      },
      "new": {
        "header": "New Report"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete %{name}?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete",
          "edit": "Edit"
        }
      },
      "update": {
        "successfully": "Item %{name} was successfully updated."
      }
    },
    "memberships": {
      "admin": {
        "new": {
          "header": "New admin"
        }
      },
      "admin_chosen": {
        "successfully": "Admin users was successfully updated."
      },
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully deleted."
      },
      "edit": {
        "add": "Add",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "index": {
        "export": "Export",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "new": "Add",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    },
    "meta_title": "Administration panel",
    "modified_by": "Modified By",
    "navigation": {
      "admins": "Admins",
      "assessments": "Assessments",
      "campaign_templates": "Campaign Templates",
      "campaigns": "Campaigns",
      "client": "Client Tenancy",
      "client_admins": "Client Admins",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "datasheets": "Datasheets",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "licenses": "Licenses",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "products": "Products",
      "project_admins": "Project Admins",
      "projects": "Projects",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "report_families": "Report Bundles",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_campaigns": "Sub Campaigns",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "new": "New",
    "no_data_found": "No data found",
    "norms": {
      "copy": {
        "error": "Norm #%{id} was not copied."
      },
      "create": {
        "successfully": "Norm %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Norm %{name} was successfully deleted."
      },
      "edit": {
        "header": "Rename Norm"
      },
      "editor": {
        "factors": "Factors",
        "inplace_title": "Enter value",
        "sub_factors": "Sub Factors",
        "title": "Norm Editor",
        "tooltips": {
          "edit": "Edit Title"
        }
      },
      "index": {
        "export": "Export",
        "import": "Import",
        "new": "Add",
        "owner": "Owner",
        "title": "Norms"
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New norm"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Norm?</p>\n",
            "title": "Delete <strong>Norm</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Norm?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Norm",
          "delete": "Delete Norm",
          "edit": "Rename Norm"
        }
      },
      "sidebar": {
        "assign": "Assign Norm",
        "copy": "Copy Norm",
        "destroy": "Delete Norm",
        "disable": "Disable",
        "edit": "Rename Norm",
        "editor": "Norm Editor",
        "enable": "Enable",
        "export": "Export Norm",
        "import": "Import Norm",
        "new": "New Norm",
        "surveys": "Linked Surveys",
        "title": "Norm's options",
        "view": "View Norm"
      },
      "toggle_status": {
        "successfully": "Norm was successfully updated."
      },
      "update": {
        "successfully": "Norm %{name} was successfully updated."
      }
    },
    "noty": {
      "error_408": "This action takes too long. Please try to reload the page.",
      "error_500": "Something went wrong. Contact your administrator."
    },
    "occupations": {
      "copy": {
        "error": "Occupation #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Occupation #%{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit occupation"
      },
      "form": {
        "hint": {
          "key_career_tracks": "\"+\" - list, \"*\" - bold. Example: + *Biology* - some description..."
        }
      },
      "index": {
        "new": "Add",
        "title": "Occupations",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New occupation"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this occupation?</p>\n",
            "title": "Delete <strong>Occupation</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Occupation",
          "delete": "Delete Occupation",
          "edit": "Edit Occupation"
        }
      },
      "sidebar": {
        "copy": "Copy Occupation",
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "New Occupation",
        "title": "Occupation's options"
      },
      "toggle_status": {
        "successfully": "Occupation was successfully updated."
      }
    },
    "occupations_factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor #%{name} was successfully detached."
      },
      "edit": {
        "header": "Edit Factor"
      },
      "index": {
        "new": "Add",
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "Attach Factors"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this factor?</p>",
            "title": "Delete <strong>Factor</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete Factor",
          "edit": "Edit Factor"
        }
      },
      "sidebar": {
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "Attach Factor",
        "title": "Factor's options"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "products": {
      "copy": {
        "error": "Product",
        "successfully": "Product %{name} was successfully copied."
      },
      "create": {
        "successfully": "Product %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Product %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Product"
      },
      "form": {
        "add_image": "Add Image",
        "images": "Images",
        "prices": "Prices",
        "reports": "Reports"
      },
      "image_fields": {
        "remove": "Remove Image"
      },
      "index": {
        "new": "Add",
        "title": "Products list"
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New Product"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Product?</p>\n",
            "title": "Delete <strong>Product</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Product?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Product",
          "delete": "Delete Product",
          "edit": "Edit Product"
        }
      },
      "sidebar": {
        "copy": "Copy Product",
        "destroy": "Destroy Product",
        "disable": "Disable",
        "edit": "Edit Product",
        "enable": "Enable",
        "new": "New Product",
        "title": "Product's options"
      },
      "update": {
        "successfully": "Product %{name} was successfully updated."
      }
    },
    "profiles": {
      "edit": {
        "success": "Profile was successfully updated.",
        "title": "Profile Editor"
      }
    },
    "psychometrics": "Psychometrics",
    "questions": {
      "destroy": {
        "successfully": "Question %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Question"
      },
      "index": {
        "owner": "Owner"
      },
      "new": {
        "header": "New Question"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Question?</p>\n",
            "title": "Delete <strong>Question</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Question?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "report_families": {
      "copy": {
        "error": "Report Bundle #%{id} was not copied."
      },
      "create": {
        "successfully": "Report Bundle %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Report Bundle %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Report Bundle Name"
      },
      "index": {
        "add": "Add",
        "families": "Families",
        "title": "Report Bundles",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New Report Bundle"
      },
      "reports": {
        "index": {
          "add": "Add new Report",
          "title": "Reports in the Bundle",
          "tooltips": {
            "create": "Create"
          }
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Report from Bundle?</p>\n",
              "title": "Delete <strong>Report</strong> from Bundle?"
            }
          },
          "tooltips": {
            "delete": "Delete Report from Bundle"
          }
        }
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Report Bundle?</p>\n",
            "title": "Delete <strong>Report</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Report Bundle?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Report Bundle",
          "delete": "Delete Report Bundle",
          "edit": "Edit Report Bundle",
          "preview": "Preview Report Bundle"
        }
      },
      "sidebar": {
        "copy": "Copy Report Bundle",
        "destroy": "Delete Report Bundle",
        "edit": "Edit Report Bundle",
        "title": "Report Bundle's options",
        "view": "View Report Bundle"
      },
      "update": {
        "successfully": "Report Bundle %{name} was successfully updated."
      }
    },
    "reports": {
      "copy": {
        "error": "Report #%{id} was not copied."
      },
      "create": {
        "successfully": "Report %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Report %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Report Name"
      },
      "form": {
        "load_mindmill_report": "Load from Mindmill",
        "none_external": "None - Use report builder",
        "select_family": "Select Report Bundle",
        "types": {
          "common": "Any",
          "eti": "ETI",
          "yti": "YTI"
        }
      },
      "index": {
        "add": "Add",
        "bulk_download": "Bulk Download",
        "families": "Report Bundles",
        "filterrific": {
          "with_assessment_category": {
            "360": "360 Feedback",
            "all": "All",
            "case_study": "Case Studies",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "owner": "Owner",
        "regenerate": "Regenerate Reports",
        "report_family": "Report Bundle",
        "title": "Reports",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "Select Report"
      },
      "preview": {
        "export_pdf": "Export to PDF",
        "title": "Preview"
      },
      "regenerate": {
        "successfully": "Report successfully sent for regeneration"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Report?</p>\n",
            "title": "Delete <strong>Report</strong> ?"
          },
          "detach": {
            "body": "<p>Are you sure you want to detach this Report?</p>\n",
            "title": "Detach <strong>Report</strong> ?"
          },
          "regenerate": {
            "body": "<p>Are you sure you want to regenerate this Report for all Users?</p>",
            "title": "Regenerate <strong>%{name}</strong>?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Report",
          "delete": "Delete Report",
          "edit": "Edit Report",
          "preview": "Preview Report"
        }
      },
      "sidebar": {
        "copy": "Copy Report",
        "destroy": "Delete Report",
        "edit": "Edit Report",
        "regenerate": "Regenerate Report",
        "title": "Report's options",
        "view": "View Report"
      },
      "toggle_status": {
        "successfully": "Report was successfully updated."
      },
      "types": {
        "common": "Any",
        "eti": "ETI",
        "yti": "YTI"
      },
      "update": {
        "successfully": "Report %{name} was successfully updated."
      }
    },
    "save": "Save",
    "search": "Search",
    "show": "Show",
    "sub_factors": {
      "copy": {
        "error": "Sub-Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Sub-Factor %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Sub-Factor Name"
      },
      "index": {
        "new": "Add",
        "title": "Sub-Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Sub-Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Sub-Factor?</p>\n",
            "title": "Delete <strong>Sub-Factor</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Sub-Factor",
          "delete": "Delete Sub-Factor",
          "edit": "Edit Sub-Factor Name"
        }
      },
      "sidebar": {
        "destroy": "Delete Sub-Factor",
        "edit": "Edit Sub-Factor",
        "title": "Sub-Factor's options"
      },
      "toggle_status": {
        "successfully": "Sub-Factor was successfully updated."
      }
    },
    "templates": {
      "blocks": {
        "copy": {
          "error": "Block"
        },
        "destroy": {
          "successfully": "Block %{name} was successfully deleted."
        },
        "edit": {
          "header": "Edit Block"
        },
        "index": {
          "new": "Add",
          "templates": {
          },
          "title": "Blocks",
          "tooltips": {
            "create": "Create"
          }
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New Block"
        },
        "new_assign": {
          "header": "Assign Block to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Block",
            "delete": "Delete Block",
            "edit": "Edit Block"
          }
        },
        "sidebar": {
          "destroy": "Delete Block",
          "disable": "Disable",
          "edit": "Edit Block",
          "enable": "Enable",
          "new": "New Block",
          "new_assign": "Assign Block",
          "title": "Block's options"
        }
      },
      "questions": {
        "copy": {
          "error": "Question"
        },
        "destroy": {
          "successfully": "Question %{name} was successfully deleted."
        },
        "edit": {
          "header": "Edit Question"
        },
        "index": {
          "new": "Add",
          "templates": {
            "blocks": "Blocks",
            "questions": "Questions"
          },
          "title": "Questions",
          "tooltips": {
            "create": "Create"
          }
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New Question"
        },
        "new_assign": {
          "header": "Assign Question to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Question",
            "delete": "Delete Question",
            "edit": "Edit Question"
          }
        },
        "sidebar": {
          "destroy": "Delete Question",
          "disable": "Disable",
          "edit": "Edit Question",
          "enable": "Enable",
          "new": "New Question",
          "new_assign": "Assign Question",
          "title": "Question's options"
        }
      }
    },
    "tenancies": "Tenancies",
    "threesixty_campaigns": {
      "email_templates": {
        "approve_nomination": {
          "description": "This message is sent to a manager when a nomination, made by a direct report, needs to be approved",
          "name": "Approve Nomination"
        },
        "approve_report": {
          "description": "This message is sent to a subject's manager to notify them that the subjects report is ready for approval",
          "name": "Approve Report"
        },
        "categories": {
          "approvals": "Approvals",
          "invitations": "Invitations",
          "reminders": "Reminders",
          "report_ready": "Report Ready"
        },
        "custom_message": {
          "description": "This message can be sent to anyone participating in the assessment",
          "name": "Custom Message"
        },
        "days_repeated": "days, repeated",
        "evaluator_invite": {
          "description": "This message will be sent to all participants that are evaluators",
          "name": "Evaluator Invite"
        },
        "evaluator_reminder": {
          "description": "This message will be sent to remind evaluators to complete pending evaluations",
          "name": "Evaluator Reminder",
          "rule_description": "Specify rules for automatically scheduling when an invitation is scheduled",
          "rule_name": "Evaluator Reminder Rules"
        },
        "from": "From",
        "manager_report_ready": {
          "description": "This message is sent to a subject's manager once the subject's report is ready",
          "name": "Manager Report Ready"
        },
        "nomination_denied": {
          "description": "This message is sent to subjects when a nomination is denied",
          "name": "Nomination Denied"
        },
        "reply_to_email": "Reply to email",
        "request_approval": {
          "description": "This message is sent to managers when a subject requests approval",
          "name": "Request Approval"
        },
        "schedule_email": "Schedule Email",
        "send_test_email": "Send Test Email",
        "subject": "Subject",
        "subject_invite": {
          "description": "This message will be sent to invite subjects to participate in the assessment",
          "name": "Subject Invite"
        },
        "subject_reminder": {
          "description": "Message sent to each participant to remind them to participate in the assessment",
          "name": "Subject Reminder",
          "rule_description": "Specify rules for automatically scheduling when an invitation is scheduled",
          "rule_name": "Subject Reminder Rules"
        },
        "subject_report_ready": {
          "description": "This message is sent to a subject once their report is ready",
          "name": "Subject Report Ready"
        },
        "times": "times"
      },
      "instruction_templates": {
        "evaluate_others": {
          "description": "This message will be displayed when participants are evaluating others from inside the portal",
          "name": "Evaluate Others"
        },
        "evaluate_self": {
          "description": "This message will be displayed to subjects when they begin their self-evaluation",
          "name": "Evaluator Self"
        },
        "evaluator_welcome": {
          "description": "This message will override the \"Welcome Message\" and be displayed to participants who are currently participating as evaluators only.",
          "name": "Evaluator welcome"
        },
        "invite_evaluators": {
          "description": "This message will be displayed to subjects when they begin nominating evaluators",
          "name": "Invite Evaluators"
        },
        "welcome_message": {
          "description": "This message will be displayed to subjects when they log in to begin the assessment or view their task list",
          "name": "Welcome Message"
        }
      }
    },
    "translations": {
      "assessments": {
        "new": {
          "header": "Import Translations"
        }
      },
      "import": {
        "successfully": "Translations was successfully imported"
      }
    },
    "tte": "TTE",
    "uniq_id": "Uniq ID",
    "update": "Update",
    "updated": "Successfully updated",
    "users": {
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully deleted."
      },
      "edit": {
        "add": "Add",
        "grants": "Privileges",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "form": {
        "choose": " - Choose - "
      },
      "index": {
        "breadcrumb": "Users",
        "export": "Export",
        "export_completion_status": "Completion Status",
        "export_users": "Users",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "new": "Add",
        "new_superadmin": "Add SuperAdmin",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "resource": {
        "confirmations": {
          "change_password": {
            "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
            "title": "Change password <strong>%{name}</strong> ?"
          },
          "delete": {
            "body": "<p>Are you sure you want to delete this User?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "membership": {
            "delete": {
              "body": "<p>Are you sure you want to delete?</p>\n",
              "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
            }
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this User?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "change_password": "Change Password",
          "chart": "View user report",
          "delete": "Delete User",
          "edit": "Edit User",
          "mail": "Send Mail",
          "sign_in": "Login as user"
        }
      },
      "sidebar": {
        "api_keys": "API keys",
        "assessments_and_reports": "Assessments and Reporting",
        "destroy": "Delete User",
        "disable": "Disable",
        "edit_user": "Edit User",
        "email": "Send Mail",
        "enable": "Enable",
        "export_users": "Export users",
        "import_users": "Import users",
        "login_as_user": "Login as User",
        "new_user": "New User",
        "reset_password": "Change Password",
        "title": "User's options"
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    }
  },
  "assessments": {
    "decorator": {
      "no_description": "Description is empty"
    },
    "index": {
      "managers_assessments_button": "Action Planning",
      "managers_dashboard_button": "Managers Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "resource": {
      "assigned": "Assigned %{date}",
      "invite_users": "Invite Users",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "results": "Results",
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start"
      }
    }
  },
  "assigns": {
    "assign": {
      "accept_privacy_modal": {
        "accept": "Accept",
        "reject": "Reject",
        "text": "In completing this questionnaire(s), you are consenting for any data collected as a result to be used for the purposes intended and described in the communication you have already received. Your responses to the questions asked, along with any other associated data provided, will be used for the purposes of analysing and reporting your individual responses. We may also use your responses as part of large scale research projects. Your data will be treated with the requisite sensitivity and security. Please click <a href='https://thetalententerprise.com/privacy-statement/' target='_blank'>here</a> / go to this website to find out more or to contact someone for any more specific queries you may have.",
        "title": "Data processing consent"
      },
      "assigned": "Assigned %{date}",
      "mindmill_confirmation": "Starting this assessment you will lost results \"%{assessment}\". Click \"Cancel\" if you want leave results, and click \"Ok\" if you want continue",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start",
        "overdue": "Overdue"
      }
    },
    "assigns_reports": {
      "download": "Download",
      "duration": "Duration",
      "progress": "Progress",
      "summary_report": "Summary report"
    },
    "decorator": {
      "completed": "Completed %{date}",
      "no_description": "Description is empty",
      "not_completed": "Not Completed"
    },
    "index": {
      "managers_dashboard_button": "Managers Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "multiple_report": {
      "results": "Results"
    },
    "notifications": {
      "completed": "%{user_name} finished assessment \"%{assessment_name}\"",
      "in_progress": "%{user_name} started to take assessment \"%{assessment_name}\""
    },
    "project_assessment": {
      "accept_privacy_modal": {
        "accept": "Accept",
        "reject": "Reject",
        "text": "In completing this questionnaire(s), you are consenting for any data collected as a result to be used for the purposes intended and described in the communication you have already received. Your responses to the questions asked, along with any other associated data provided, will be used for the purposes of analysing and reporting your individual responses. We may also use your responses as part of large scale research projects. Your data will be treated with the requisite sensitivity and security. Please click <a href='https://thetalententerprise.com/privacy-statement/' target='_blank'>here</a> / go to this website to find out more or to contact someone for any more specific queries you may have.",
        "title": "Data processing consent"
      },
      "assigned": "Assigned %{date}",
      "mindmill_confirmation": "Starting this assessment you will lost results \"%{assessment}\". Click \"Cancel\" if you want leave results, and click \"Ok\" if you want continue",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start",
        "overdue": "Overdue"
      }
    },
    "reports": {
      "load_results": "Load Results: %{report}",
      "processing": "Processing...",
      "results": "Results"
    }
  },
  "ckeditor": {
    "buttons": {
      "cancel": "Cancel",
      "delete": "Delete",
      "next": "Next",
      "upload": "Upload"
    },
    "confirm_delete": "Delete file?",
    "page_title": "CKEditor Files Manager"
  },
  "clear_filter": "Clear Filter",
  "confirmation": {
    "default_body": "Are you sure?",
    "default_title": "Confirmation"
  },
  "currencies": {
    "AED": "AED",
    "BHD": "BHD",
    "BYN": "BYN",
    "EUR": "EUR",
    "GBP": "GBP",
    "INR": "INR",
    "KWD": "KWD",
    "OMR": "OMR",
    "QAR": "QAR",
    "SAR": "SAR",
    "USD": "USD"
  },
  "date": {
    "abbr_day_names": [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "abbr_month_names": [
      null,
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    "day_names": [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "formats": {
      "default": "%Y-%m-%d",
      "long": "%B %d, %Y",
      "short": "%b %d"
    },
    "month_names": [
      null,
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    "order": [
      "year",
      "month",
      "day"
    ]
  },
  "datetime": {
    "distance_in_words": {
      "about_x_hours": {
        "one": "about 1 hour",
        "other": "about %{count} hours"
      },
      "about_x_months": {
        "one": "about 1 month",
        "other": "about %{count} months"
      },
      "about_x_years": {
        "one": "about 1 year",
        "other": "about %{count} years"
      },
      "almost_x_years": {
        "one": "almost 1 year",
        "other": "almost %{count} years"
      },
      "half_a_minute": "half a minute",
      "less_than_x_minutes": {
        "one": "less than a minute",
        "other": "less than %{count} minutes"
      },
      "less_than_x_seconds": {
        "one": "less than 1 second",
        "other": "less than %{count} seconds"
      },
      "over_x_years": {
        "one": "over 1 year",
        "other": "over %{count} years"
      },
      "x_days": {
        "one": "1 day",
        "other": "%{count} days"
      },
      "x_minutes": {
        "one": "1 minute",
        "other": "%{count} minutes"
      },
      "x_months": {
        "one": "1 month",
        "other": "%{count} months"
      },
      "x_seconds": {
        "one": "1 second",
        "other": "%{count} seconds"
      }
    },
    "prompts": {
      "day": "Day",
      "hour": "Hour",
      "minute": "Minute",
      "month": "Month",
      "second": "Seconds",
      "year": "Year"
    }
  },
  "devise": {
    "administrators": {
      "meta_title": "Login to administration panel",
      "passwords": {
        "edit": {
          "submit": "Set new password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "submit": "Send me instructions",
          "title": "Forgot your password?"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": "Contact Us",
          "privacy": "Privacy"
        }
      }
    },
    "confirmations": {
      "confirmed": "تمّ تأكيد الحساب بنجاح، وتمّ تسجيل الدّخول.",
      "new": {
        "resend_confirmation_instructions": "أعدْ إرسال تعليمات التأكيد"
      },
      "send_instructions": "ستصل خلال دقائق رسالة على البريد الإلكتروني تتضمّن الخطوات اللازمة لتأكيد الحساب.",
      "send_paranoid_instructions": "إذا كان البريد الإلكتروني مسجّلاً، فستصل خلال دقائق رسالة تتضمّن الخطوات اللازمة لتأكيد الحساب."
    },
    "failure": {
      "already_authenticated": "تم تسجيل الدخول من قَبل.",
      "inactive": "لم يتمّ تنشيط الحساب بعد.",
      "invalid": "البريد الإلكتروني أو كلمة السر غير صحيحة.",
      "invited": "You have a pending invitation, accept it to finish creating your account.",
      "last_attempt": "بقيت محاولة أخيرة قبل غلق الحساب.",
      "locked": "الحساب مُعلّق.",
      "not_found_in_database": "خطأ فى البريد الإلكتروني أو كلمة السر",
      "timeout": "لقد انتهت صلاحيّة الجلسة، الرجاء تسجيل الدّخول مجدداً.",
      "unauthenticated": "يجب إنشاء حساب أو تسجيل الدخول قبل المتابعة.",
      "unconfirmed": "يجب تأكيد الحساب حتّى تتمكّن من المُتابعة."
    },
    "invitations": {
      "edit": {
        "confirm_password_label": "Confirm Password",
        "description": "To create a new password, please enter your new password in the boxes below.",
        "header": "Set your password",
        "password_label": "Password",
        "submit": "Set New Password",
        "submit_button": "Set my password",
        "title": "Create password"
      },
      "invitation_removed": "Your invitation was removed.",
      "invitation_token_invalid": "The invitation token provided is not valid!",
      "new": {
        "header": "Send invitation",
        "submit_button": "Send an invitation"
      },
      "no_invitations_remaining": "No invitations remaining",
      "send_instructions": "An invitation email has been sent to %{email}.",
      "updated": "Your password was set successfully. You are now signed in.",
      "updated_not_active": "Your password was set successfully."
    },
    "mailer": {
      "confirmation_instructions": {
        "action": "أكّد حسابي",
        "greeting": "مرحبا %{recipient}",
        "instruction": "يمكن تأكيد حساب بريدك الإلكتروني من خلال الرابط التّالي:",
        "subject": "تعليمات تأكيد الحساب"
      },
      "email_changed": {
        "subject": "Email Changed"
      },
      "invitation_instructions": {
        "accept": "Accept invitation",
        "accept_until": "This invitation will be due in %{due_date}.",
        "hello": "Hello %{email}",
        "ignore": "If you don't want to accept the invitation, please ignore this email.<br />\\nYour account won't be created until you access the link above and set your password.",
        "someone_invited_you": "Someone has invited you to %{url}, you can accept it through the link below.",
        "subject": "The Talent Enterprise – Your Link to Thriving Index"
      },
      "password_change": {
        "greeting": "Hello %{recipient}!",
        "message": "We're contacting you to notify you that your password has been changed.",
        "subject": "Password Changed"
      },
      "reset_password_instructions": {
        "action": "غيّر كلمة السر",
        "greeting": "مرحبا %{recipient}",
        "instruction": "طلب أحدهم رابطًا لتغيير كلمة السر الخاصة بك، ويُمكن عمل ذلك من خلال الرابط التالي.",
        "instruction_2": "إن لم تكن أنت من طلب هذا، من فضلك تجاهل هذه الرسالة.",
        "instruction_3": "لن تتغيّر كلمة السر الخاصة بك حتى تتبع الرابط السابق وتُنشئ كلمة سر جديدة.",
        "subject": "تعليمات إعادة تعيين كلمة المرور"
      },
      "unlock_instructions": {
        "action": "أزلْ الحظر عن حسابي",
        "greeting": "مرحبًا %{recipient}",
        "instruction": "انقرْ الرابط على الرابط التالي لفك الحظر عن حسابك:",
        "message": "قُفل حسابك بسبب المحاولات الفاشلة في تسجيل الدخول.",
        "subject": "تعليمات إعادة تفعيل الحساب"
      }
    },
    "omniauth_callbacks": {
      "failure": "فشلت عمليّة التحقق عبر %{kind} للسبب التّالي: %{reason}",
      "success": "تمّ التحقّق من الحساب بنجاح بإستخدام %{kind}"
    },
    "passwords": {
      "edit": {
        "change_my_password": "غيّر كلمة المرور خاصتي",
        "change_your_password": "غيّر كلمة المرور الخاصة بك",
        "confirm_new_password": "أكّد كلمة السر الجديدة",
        "description": "To create a new password, please enter your new password in the boxes below.",
        "new_password": "كلمة سر جديدة",
        "title": "Create Password"
      },
      "new": {
        "back": "Return back",
        "description": "Please enter your email address in the box below and click 'Reset Password'.",
        "email_label": "Email Address",
        "forgot_your_password": "هل نسيت كلمة المرور؟",
        "send_me_reset_password_instructions": "أرسلْ لي تعليمات تصفير كلمة المرور",
        "submit": "Reset Password",
        "title": "Forgotten Password"
      },
      "no_token": "لا يُمكن الدّخول إلى هذه الصفحة إلّا بإستخدام رسالة إعادة ضبط كلمة المرور. إن كان الوصول لهذه الصفحة عبر تلك الرسالة فالرجاء التأكد من فتح كامل الرابط بشكل صحيح.",
      "send_instructions": "ستصل خلال دقائق رسالة بريد إلكتروني تحوي التعليمات اللازمة لإعادة ضبط كلمة السر.",
      "send_paranoid_instructions": "إذا كان بريدك الإلكتروني مسجلاً عندنا فستصل إليه خلال دقائق رسالة تتضمّن رابطاً لاستعادة كلمة المرور.",
      "updated": "لقد تمّ تغيير كلمة المرور بنجاح، وتم تسجيل الدخول.",
      "updated_not_active": "تمّ تعديل كلمة المرور بنجاح."
    },
    "registrations": {
      "destroyed": "لقد تمّت إزالة الحساب، نأمل في نتقابل مجدداً في وقت قريب، إلى اللقاء! ",
      "edit": {
        "are_you_sure": "هل أنت متأكّد؟",
        "cancel_my_account": "ألغِ حسابي",
        "currently_waiting_confirmation_for_email": "في انتظار تفعيل البريد الإلكتروني %{email}",
        "leave_blank_if_you_don_t_want_to_change_it": "أبقه فارغًا إن كنت لا ترغب في تغييره",
        "title": "تعديل %{resource}",
        "unhappy": "غير راضٍ؟",
        "update": "تحديث",
        "we_need_your_current_password_to_confirm_your_changes": "نحتاج كلمة المرور الحالية خاصتك لتأكيد تغيراتك"
      },
      "new": {
        "sign_up": "سجّلْ",
        "submit": "Register",
        "tabs": {
          "register": "Register",
          "sign_in": "Sign In"
        }
      },
      "signed_up": "تمّ التسجيل في الموقع بنجاح، أهلاً وسهلاً!",
      "signed_up_but_inactive": "تمّ التسجيل في الموقع بنجاح، ولكن لا يُمكن تسجيل الدخول قبل تفعيل الحساب.",
      "signed_up_but_locked": "تمّ التسجيل في الموقع بنجاح، ولكن لا يمكن تسجيل الدخول ﻷن الحساب مُعلّق.",
      "signed_up_but_unconfirmed": "تمّ إرسال رسالة تحوي على رابط تأكيد الحساب باستخدام البريد الإلكتروني، يُرجى فتح الرابط لتفعيل الحساب.",
      "update_needs_confirmation": "تُم تعديل الحساب بنجاح، يرجى تأكيد البريد الإلكتروني. الرجاء الذهاب الى البريد الإلكتروني والضغط على الرابط الموجود للانتهاء من عمليّة التاكيد.",
      "updated": "تمّ تعديل الحساب بنجاح."
    },
    "sessions": {
      "already_signed_out": "Signed out successfully.",
      "new": {
        "email_label": "Email Address",
        "forgot_password": "Forgot password?",
        "keep_sign_in": "Yes, Keep me signed in",
        "password_placeholder": "Enter your password",
        "sign_in": "سجّلْ الدخول",
        "submit": "Login",
        "tabs": {
          "register": "Register",
          "sign_in": "Login"
        }
      },
      "signed_in": "تمّ تسجيل الدخول.",
      "signed_out": "تمّ تسجيل الخروج."
    },
    "shared": {
      "links": {
        "back": "عودة",
        "didn_t_receive_confirmation_instructions": "ألم تستلم تعليمات التأكيد؟",
        "didn_t_receive_unlock_instructions": "ألم تستلم تعليمات فك الحظر؟",
        "forgot_your_password": "هل نسيت كلمة المرور؟",
        "sign_in": "سجّلْ الدخول",
        "sign_in_with_provider": "سجّلْ الدخول عن طريق %{provider}",
        "sign_up": "سجّلْ"
      }
    },
    "unlocks": {
      "new": {
        "resend_unlock_instructions": "أعدْ إرسال تعليمات فك الحظر"
      },
      "send_instructions": "خلال بضعة دقائق، سوف تصل رسالة بالتعليمات اللازمة لإعادة تفعيل الحساب.",
      "send_paranoid_instructions": "إذا كان الحساب موجوداً، ستصل رسالة خلال دقائق تتضمّن الارشادات عن كيفيّة التفعيل.  ",
      "unlocked": "لقد تمّ فتح الحساب بنجاح. الرجاء الدخول للاستمرار."
    }
  },
  "ecommerce": {
    "carts": {
      "show": {
        "back_to_catalogue": "Back to Catalogue",
        "next": "Next",
        "shopping_basket": "Shopping Basket",
        "total": "Total:",
        "update_basket": "Update Basket"
      }
    },
    "orders": {
      "new": {
        "back_to_basket": "Back to Basket",
        "order": "Order",
        "pay": "Pay",
        "product_name": "Product Name",
        "product_price": "Product Price",
        "product_quantity": "Quantity",
        "product_subtotal": "Positions Price",
        "total": "Total",
        "users": "Users"
      },
      "success": {
        "back_to_basket": "Back to Basket",
        "body": "<h3>Payment successful</h3>\n<p>We will email you a receipt confirming your oder shortly.</p>\n",
        "go_to_dashboard": "Go to Dashboard",
        "title": "Payment Successful"
      }
    },
    "products": {
      "add_to_cart": {
        "successfully": "Assessment was successfuly added to the basket"
      },
      "index": {
        "assessment_catalogue": "Assessment Catalogue",
        "shopping_basket": "Shopping Basket"
      }
    },
    "users": {
      "registrations": {
        "new": {
          "register": "Register",
          "sign_in": "Sign in"
        }
      },
      "sessions": {
        "new": {
          "register": "Register",
          "sign_in": "Sign in"
        }
      }
    }
  },
  "enums": {
    "communication": {
      "delivery_rule": {
        "in_progress": "If assessment is in progress",
        "not_competed": "If assessment is not completed",
        "not_started": "If assessment is not started",
        "send_now": "Send now",
        "specific_datetime": "Send at"
      },
      "kind": {
        "completion": "Completion",
        "invitation": "Invitation",
        "other": "Other",
        "reminder": "Reminder"
      },
      "recipients": {
        "all": "All",
        "selected": "Selected"
      }
    },
    "report": {
      "type": {
        "common": "Any",
        "eti": "ETI",
        "yti": "YTI"
      }
    }
  },
  "errors": {
    "connection_refused": "Oops! Failed to connect to the Web Console middleware.\nPlease make sure a rails development server is running.\n",
    "error_500": "Something went wrong. Contact your administrator.",
    "format": "%{attribute} %{message}",
    "invalid_token": "Something went wrong. Plese reload the page and try again.",
    "messages": {
      "accepted": "must be accepted",
      "after": "must be after %{date}",
      "after_or_equal_to": "must be after or equal to %{date}",
      "allowed_file_content_types": "file should be one of %{types}",
      "already_confirmed": "الحساب مُفعّل، الرجاء محاولة تسجيل الدخول",
      "before": "must be before %{date}",
      "before_or_equal_to": "must be before or equal to %{date}",
      "blank": "can't be blank",
      "carrierwave_direct_allowed_extensions": "Allowed file types are %{extensions}",
      "carrierwave_direct_allowed_schemes": "Allowed schemes are %{schemes}",
      "carrierwave_direct_attachment_missing": "attachment is missing",
      "carrierwave_direct_filename_invalid": "is invalid. ",
      "carrierwave_direct_filename_taken": "filename was already taken",
      "carrierwave_direct_upload_missing": "upload is missing",
      "carrierwave_download_error": "could not be downloaded",
      "carrierwave_integrity_error": "is not of an allowed file type",
      "carrierwave_processing_error": "failed to be processed",
      "confirmation": "doesn't match %{attribute}",
      "confirmation_period_expired": "بحاجة الى تفعيل خلال %{period}، الرجاء طلب تفعيل ",
      "content_type_blacklist_error": "You are not allowed to upload %{content_type} files",
      "content_type_whitelist_error": "You are not allowed to upload %{content_type} files",
      "empty": "can't be empty",
      "equal_to": "must be equal to %{date}",
      "even": "must be even",
      "excluded_file_content_types": "file cannot be %{types}",
      "exclusion": "is reserved",
      "expired": "انتهت الصلاحيّة، الرجاء عمل طلب جديد",
      "extension_blacklist_error": "You are not allowed to upload %{extension} files, prohibited types: %{prohibited_types}",
      "extension_whitelist_error": "You are not allowed to upload %{extension} files, allowed types: %{allowed_types}",
      "file_size_is_greater_than": "file size must be greater than %{count}",
      "file_size_is_greater_than_or_equal_to": "file size must be greater than or equal to %{count}",
      "file_size_is_in": "file size must be between %{min} and %{max}",
      "file_size_is_less_than": "file size must be less than %{count}",
      "file_size_is_less_than_or_equal_to": "file size must be less than or equal to %{count}",
      "greater_than": "must be greater than %{count}",
      "greater_than_or_equal_to": "must be greater than or equal to %{count}",
      "inclusion": "is not included in the list",
      "invalid": "is invalid",
      "invalid_currency": "must be a valid currency (eg. '100', '5%{decimal}24', or '123%{thousands}456%{decimal}78'). Got %{currency}",
      "less_than": "must be less than %{count}",
      "less_than_or_equal_to": "must be less than or equal to %{count}",
      "max_size_error": "File size should be less than %{max_size}",
      "min_size_error": "File size should be greater than %{min_size}",
      "mini_magick_processing_error": "Failed to manipulate with MiniMagick, maybe it is not an image? Original Error: %{e}",
      "model_invalid": "Validation failed: %{errors}",
      "not_a_date": "is not a date",
      "not_a_number": "is not a number",
      "not_an_integer": "must be an integer",
      "not_found": "غير موجود",
      "not_locked": "غير مقفل",
      "not_saved": {
        "few": "%{count} مشكلة منعت %{resource} من التخزين بنجاح.",
        "many": "%{count} مشاكل منعت %{resource} من التخزين بنجاح.",
        "one": "مشكلة واحدة منعت %{resource} من التخزين بنجاح.",
        "other": "%{count} مشكلة منعت %{resource} من التخزين بنجاح.",
        "two": "مشكلتين منعتا %{resource} من التخزين بنجاح.",
        "zero": null
      },
      "odd": "must be odd",
      "other_than": "must be other than %{count}",
      "present": "must be blank",
      "required": "must exist",
      "rmagick_processing_error": "Failed to manipulate with rmagick, maybe it is not an image?",
      "taken": "has already been taken",
      "too_long": {
        "one": "is too long (maximum is 1 character)",
        "other": "is too long (maximum is %{count} characters)"
      },
      "too_short": {
        "one": "is too short (minimum is 1 character)",
        "other": "is too short (minimum is %{count} characters)"
      },
      "wrong_length": {
        "one": "is the wrong length (should be 1 character)",
        "other": "is the wrong length (should be %{count} characters)"
      }
    },
    "try_again": "Please try again",
    "unacceptable_request": "A supported version is expected in the Accept header.\n",
    "unavailable_session": "Session %{id} is is no longer available in memory.\n\nIf you happen to run on a multi-process server (like Unicorn or Puma) the process\nthis request hit doesn't store %{id} in memory. Consider turning the number of\nprocesses/workers to one (1) or using a different server in development.\n"
  },
  "flash": {
    "actions": {
      "create": {
        "notice": "%{resource_name} was successfully created."
      },
      "destroy": {
        "alert": "%{resource_name} could not be destroyed.",
        "notice": "%{resource_name} was successfully destroyed."
      },
      "update": {
        "notice": "%{resource_name} was successfully updated."
      }
    }
  },
  "helpers": {
    "page_entries_info": {
      "more_pages": {
        "display_entries": "Displaying %{entry_name} <b>%{first}&nbsp;-&nbsp;%{last}</b> of <b>%{total}</b> in total"
      },
      "one_page": {
        "display_entries": {
          "one": "Displaying <b>1</b> %{entry_name}",
          "other": "Displaying <b>all %{count}</b> %{entry_name}",
          "zero": "No %{entry_name} found"
        }
      }
    },
    "select": {
      "prompt": "Please select"
    },
    "submit": {
      "create": "Create %{model}",
      "submit": "Save %{model}",
      "update": "Update %{model}"
    }
  },
  "hogan": {
    "assigns": {
      "results": {
        "not_completed": "Hogan Report isn't ready yet",
        "successfully": "Hogan Report was successfully saved"
      }
    }
  },
  "home": {
    "survey_instructions": {
      "title": "Instructions"
    }
  },
  "i18n_tasks": {
    "add_missing": {
      "added": {
        "one": "Added %{count} key",
        "other": "Added %{count} keys"
      }
    },
    "cmd": {
      "args": {
        "default_text": "Default: %{value}",
        "desc": {
          "all_locales": "Do not expect key patterns to start with a locale, instead apply them to all locales implicitly.",
          "confirm": "Confirm automatically",
          "data_format": "Data format: %{valid_text}.",
          "keep_order": "Keep the order of the keys",
          "key_pattern": "Filter by key pattern (e.g. 'common.*')",
          "key_pattern_to_rename": "Full key (pattern) to rename. Required",
          "locale": "i18n_tasks.common.locale",
          "locale_to_translate_from": "Locale to translate from",
          "locales_filter": "Locale(s) to process. Special: base",
          "missing_types": "Filter by types: %{valid}",
          "new_key_name": "New name, interpolates original name as %{key}. Required",
          "nostdin": "Do not read from stdin",
          "out_format": "Output format: %{valid_text}",
          "pattern_router": "Use pattern router: keys moved per config data.write",
          "strict": "Avoid inferring dynamic key usages such as t(\"cats.#{cat}.name\"). Takes precedence over the config setting if set.",
          "translation_backend": "Translation backend (google or deepl)",
          "value": "Value. Interpolates: %{value}, %{human_key}, %{key}, %{default}, %{value_or_human_key}, %{value_or_default_or_human_key}"
        }
      },
      "desc": {
        "add_missing": "add missing keys to locale data",
        "check_consistent_interpolations": "verify that all translations use correct interpolation variables",
        "check_normalized": "verify that all translation data is normalized",
        "config": "display i18n-tasks configuration",
        "data": "show locale data",
        "data_merge": "merge locale data with trees",
        "data_remove": "remove keys present in tree from data",
        "data_write": "replace locale data with tree",
        "eq_base": "show translations equal to base value",
        "find": "show where keys are used in the code",
        "gem_path": "show path to the gem",
        "health": "is everything OK?",
        "irb": "start REPL session within i18n-tasks context",
        "missing": "show missing translations",
        "mv": "rename/merge the keys in locale data that match the given pattern",
        "normalize": "normalize translation data: sort and move to the right files",
        "remove_unused": "remove unused keys",
        "rm": "remove the keys in locale data that match the given pattern",
        "translate_missing": "translate missing keys with Google Translate or DeepL Pro",
        "tree_convert": "convert tree between formats",
        "tree_filter": "filter tree by key pattern",
        "tree_merge": "merge trees",
        "tree_mv_key": "rename/merge/remove the keys matching the given pattern",
        "tree_set_value": "set values of keys, optionally match a pattern",
        "tree_subtract": "tree A minus the keys in tree B",
        "tree_translate": "Google Translate a tree to root locales",
        "unused": "show unused translations"
      },
      "encourage": [
        "Good job!",
        "Well done!",
        "Perfect!"
      ],
      "enum_list_opt": {
        "invalid": "%{invalid} is not in: %{valid}."
      },
      "enum_opt": {
        "invalid": "%{invalid} is not one of: %{valid}."
      },
      "errors": {
        "invalid_format": "invalid format: %{invalid}. valid: %{valid}.",
        "invalid_locale": "invalid locale: %{invalid}",
        "invalid_missing_type": {
          "one": "invalid type: %{invalid}. valid: %{valid}.",
          "other": "unknown types: %{invalid}. valid: %{valid}."
        },
        "pass_forest": "pass locale forest"
      }
    },
    "common": {
      "continue_q": "Continue?",
      "key": "Key",
      "locale": "Locale",
      "n_more": "%{count} more",
      "value": "Value"
    },
    "data_stats": {
      "text": "has %{key_count} keys across %{locale_count} locales. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments, a locale has %{per_locale_avg} keys.",
      "text_single_locale": "has %{key_count} keys in total. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments.",
      "title": "Forest (%{locales})"
    },
    "deepl_translate": {
      "errors": {
        "no_api_key": "Setup DeepL Pro API key via DEEPL_AUTH_KEY environment variable or translation.deepl_api_key in config/i18n-tasks.yml. Get the key at https://www.deepl.com/pro.",
        "no_results": "DeepL returned no results."
      }
    },
    "google_translate": {
      "errors": {
        "no_api_key": "Set Google API key via GOOGLE_TRANSLATE_API_KEY environment variable or translation.google_translate_api_key in config/i18n-tasks.yml. Get the key at https://code.google.com/apis/console.",
        "no_results": "Google Translate returned no results. Make sure billing information is set at https://code.google.com/apis/console."
      }
    },
    "health": {
      "no_keys_detected": "No keys detected. Check data.read in config/i18n-tasks.yml."
    },
    "inconsistent_interpolations": {
      "none": "No inconsistent interpolations found."
    },
    "missing": {
      "details_title": "Value in other locales or source",
      "none": "No translations are missing."
    },
    "remove_unused": {
      "confirm": {
        "one": "%{count} translation will be removed from %{locales}.",
        "other": "%{count} translation will be removed from %{locales}."
      },
      "noop": "No unused keys to remove",
      "removed": "Removed %{count} keys"
    },
    "translate_missing": {
      "translated": "Translated %{count} keys"
    },
    "unused": {
      "none": "Every translation is in use."
    },
    "usages": {
      "none": "No key usages found."
    }
  },
  "invites": {
    "create": {
      "successfully": "Your invitations was successfully sent"
    },
    "form": {
      "emails_hint": "Set each email in new line",
      "send_invites": "Send Invites"
    },
    "new": {
      "header": "Invite Form"
    }
  },
  "jobs": {
    "threesixty": {
      "reports": {
        "download": {
          "description": "To download the report, please follow link: <a href='%{url}' target='_blank'>Download</a>",
          "message": "Report is ready"
        }
      }
    }
  },
  "languages": {
    "ar": "Arabic",
    "bg": "Bulgarian",
    "bs": "Bosnian",
    "ca": "Catalan",
    "cn": "Chinese",
    "cs": "Czech",
    "cy": "Welsh",
    "da": "Danish",
    "de": "German",
    "el": "Greek",
    "en": "English",
    "en-GB": "English - UK",
    "eo": "Esperanto",
    "es": "Spanish (Latin America)",
    "es-ES": "Spanish (Spain)",
    "et": "Estonian",
    "fa": "Persian",
    "fi": "Finnish",
    "fr": "French",
    "gu": "Gujarati",
    "he": "Hebrew",
    "hi": "Hindi",
    "hr": "Croatian",
    "hu": "Hungarian",
    "id": "Bahasa Indonesia",
    "it": "Italian",
    "ja": "Japanese",
    "km": "Khmer",
    "ko": "Korean",
    "lt": "Lithuanian",
    "lv": "Latvian",
    "mk": "Macedonian",
    "mn": "Mongolian",
    "ms": "Bahasa Malaysia",
    "my": "Myanmar",
    "nl": "Dutch",
    "no": "Norwegian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pt-BR": "Brazilian Portuguese",
    "ro": "Romanian",
    "ru": "Russian",
    "sk": "Slovak",
    "sl": "Slovenian",
    "sr": "Serbian",
    "sv": "Swedish",
    "sw": "Swahili",
    "ta": "Tamil",
    "th": "Thai",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "vi": "Vietnamese",
    "zh": "Chinese Simplified",
    "zh-TW": "Chinese Traditional"
  },
  "layouts": {
    "users": {
      "dashboard": "Dashboard",
      "help": "Help",
      "logout": "Log Out",
      "menu": "Menu",
      "notifications": "Notifications",
      "profile": "Profile"
    }
  },
  "loading": "Processing...",
  "mailer": {
    "from": "The Talent Enterprise"
  },
  "managers": {
    "assessments": {
      "index": {
        "actions": "Actions",
        "name": "Name"
      },
      "resource": {
        "action_planning": "Action Planning"
      }
    },
    "assigns": {
      "index": {
        "title": "Assessments and Reporting Centre"
      },
      "list": {
        "action": "Action",
        "assessment_name": "Assessment Name",
        "assessment_type": "Assessment Type",
        "completion_date": "Completion Date",
        "name": "Name",
        "status": "Completion Status"
      },
      "resource": {
        "email": "Email",
        "save": "Save in PDF",
        "view": "View"
      }
    },
    "dashboard": {
      "index": {
        "assessment_center": "Assessment / Report Centre",
        "notification_center": "Notification Centre",
        "notifications": "Notifications",
        "relationships": "Company Relationships",
        "reporting": "Reporting",
        "statistics": "Statistics"
      }
    },
    "notifications": {
      "index": {
        "subtitle": "Notifications",
        "title": "Notification Centre"
      }
    },
    "reports": {
      "show": {
        "export_pdf": "Export to PDF",
        "header": "Report"
      }
    },
    "statistics": {
      "index": {
        "title": "Statistics"
      }
    },
    "tasks": {
      "comment": {
        "made_comment": "made a comment."
      },
      "edit": {
        "header": "Update Action Item"
      },
      "index": {
        "subtitle": "Action Items",
        "title": "Action Planning Dashboard",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "actions": "Actions",
        "add_item": "Add Action Item",
        "competency": "Competency",
        "high": "High Priority",
        "low": "Low Priority",
        "medium": "Medium Priority",
        "subtitle_high": "High Priority Items",
        "subtitle_low": "Low Priority Items",
        "subtitle_medium": "Medium Priority Items",
        "summary": "Showing %{total} of %{total} entries."
      },
      "new": {
        "header": "Create Action Item"
      },
      "resource": {
        "tooltips": {
          "delete": "Delete Action Item",
          "edit": "Edit Action Item"
        }
      },
      "resource_extension": {
        "add": "Add Sub Action Item",
        "add_comment": "Add Comment",
        "leave_comment": "Leave a comment/note:",
        "notes": "Notes/Comments:",
        "sub_tasks": "Sub Action Items"
      },
      "subtasks": {
        "list": {
          "actions": "Actions",
          "date": "Target Completion Date",
          "name": "Action Item",
          "status": "Status"
        }
      },
      "summary": {
        "completed": "Completed",
        "in_progress": "In Progress",
        "manager_summary": "Manager Summary",
        "not_started": "Not Started",
        "overdue": "Overdue",
        "total": "Total Items"
      },
      "summary_managers": {
        "assignee": "Assigner",
        "completed": "Completed",
        "in_progress": "In Progress",
        "not_started": "Not Started",
        "overdue": "Overdue"
      }
    },
    "users": {
      "index": {
        "title": "Company Relationships"
      }
    }
  },
  "mindmill": {
    "assigns": {
      "results": {
        "not_completed": "Mindmill Assessment not completed",
        "successfully": "Mindmill Assessment was successfully pass"
      }
    }
  },
  "next": "Next",
  "no": "No",
  "number": {
    "currency": {
      "format": {
        "delimiter": ",",
        "format": "%u%n",
        "precision": 2,
        "separator": ".",
        "significant": false,
        "strip_insignificant_zeros": false,
        "unit": "$"
      }
    },
    "format": {
      "delimiter": ",",
      "precision": 3,
      "separator": ".",
      "significant": false,
      "strip_insignificant_zeros": false
    },
    "human": {
      "decimal_units": {
        "format": "%n %u",
        "units": {
          "billion": "Billion",
          "million": "Million",
          "quadrillion": "Quadrillion",
          "thousand": "Thousand",
          "trillion": "Trillion",
          "unit": ""
        }
      },
      "format": {
        "delimiter": "",
        "precision": 3,
        "significant": true,
        "strip_insignificant_zeros": true
      },
      "storage_units": {
        "format": "%n %u",
        "units": {
          "byte": {
            "one": "Byte",
            "other": "Bytes"
          },
          "eb": "EB",
          "gb": "GB",
          "kb": "KB",
          "mb": "MB",
          "pb": "PB",
          "tb": "TB"
        }
      }
    },
    "percentage": {
      "format": {
        "delimiter": "",
        "format": "%n%"
      }
    },
    "precision": {
      "format": {
        "delimiter": ""
      }
    }
  },
  "profiles": {
    "edit": {
      "header": "Profile Settings"
    },
    "form": {
      "username": "Username"
    },
    "update": {
      "successfully": "Profile updated"
    }
  },
  "ransack": {
    "all": "all",
    "and": "and",
    "any": "any",
    "asc": "ascending",
    "attribute": "attribute",
    "combinator": "combinator",
    "condition": "condition",
    "desc": "descending",
    "or": "or",
    "predicate": "predicate",
    "predicates": {
      "blank": "is blank",
      "cont": "contains",
      "cont_all": "contains all",
      "cont_any": "contains any",
      "does_not_match": "doesn't match",
      "does_not_match_all": "doesn't match all",
      "does_not_match_any": "doesn't match any",
      "end": "ends with",
      "end_all": "ends with all",
      "end_any": "ends with any",
      "eq": "equals",
      "eq_all": "equals all",
      "eq_any": "equals any",
      "false": "is false",
      "gt": "greater than",
      "gt_all": "greater than all",
      "gt_any": "greater than any",
      "gteq": "greater than or equal to",
      "gteq_all": "greater than or equal to all",
      "gteq_any": "greater than or equal to any",
      "in": "in",
      "in_all": "in all",
      "in_any": "in any",
      "lt": "less than",
      "lt_all": "less than all",
      "lt_any": "less than any",
      "lteq": "less than or equal to",
      "lteq_all": "less than or equal to all",
      "lteq_any": "less than or equal to any",
      "matches": "matches",
      "matches_all": "matches all",
      "matches_any": "matches any",
      "not_cont": "doesn't contain",
      "not_cont_all": "doesn't contain all",
      "not_cont_any": "doesn't contain any",
      "not_end": "doesn't end with",
      "not_end_all": "doesn't end with all",
      "not_end_any": "doesn't end with any",
      "not_eq": "not equal to",
      "not_eq_all": "not equal to all",
      "not_eq_any": "not equal to any",
      "not_in": "not in",
      "not_in_all": "not in all",
      "not_in_any": "not in any",
      "not_null": "is not null",
      "not_start": "doesn't start with",
      "not_start_all": "doesn't start with all",
      "not_start_any": "doesn't start with any",
      "null": "is null",
      "present": "is present",
      "start": "starts with",
      "start_all": "starts with all",
      "start_any": "starts with any",
      "true": "is true"
    },
    "search": "search",
    "sort": "sort",
    "value": "value"
  },
  "reports": {
    "modules": {
      "common": {
        "almost_always": "Almost Always",
        "less_typical": "Less Typical",
        "moderate": "Moderate",
        "more_typical": "More Typical",
        "rare": "Rare"
      },
      "cpi_occupations": {
        "occupations": "Occupations",
        "your_potential_suitability": "Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "Gap",
        "item": "Item",
        "negative_gap": "Negative Gaps",
        "no_negative_gaps": "There are no Negative Gaps",
        "no_positive_gaps": "There are no Positive Gaps",
        "positive_gap": "Positive Gaps",
        "rank": "Rank",
        "scoring_category": "Scoring Category"
      },
      "highest_lowest": {
        "average": "Average",
        "bottom_5": "BOTTOM 5",
        "category": "Category",
        "email": "Email",
        "first_name": "First Name",
        "highest_scores": "Highest Scores",
        "item": "Item",
        "last_name": "Last Name",
        "lowest_scores": "Lowest scores",
        "mean_score": "Mean Score",
        "rank": "Rank",
        "result": "Result",
        "score": "Score",
        "scoring_category": "Scoring Category",
        "sub_competenties": "Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "career_strengths_and_results": "Career Strengths and Your Results",
        "career_sub_tracks": "Career Sub-tracks",
        "detailed_career_guide": "Detailed Career Guide",
        "diploma_qualification": "Diploma Qualification",
        "education_level": "Education Level",
        "high_school_entry_roles": "High School Entry Roles",
        "key_career_tracks_within": "Below is a list of potential job roles for each of the career tracks. Remember this list is indicative only, and not exhaustive. Do note that roles in italics require higher levels of education and / or experience.",
        "potential_areas_of_study": "Potential Areas of Study",
        "potential_roles": "Potential Roles",
        "strength_high": "Signature Strength",
        "strength_low": "Developmental Strength",
        "strength_moderate": "Potential Strength",
        "work_environment": "Work Environment",
        "your_suitability": "Your Suitability"
      },
      "potential_career_short": {
        "career": "career",
        "for_this": "for this",
        "key": "key",
        "strengths": "strengths",
        "your_scores": "Your Scores"
      },
      "single_value": {
        "factor_name": "Scoring Category",
        "question_name": "Questions"
      },
      "single_value_cluster": {
        "competency": "Competency",
        "description": "Description",
        "developmental_rating": "Developmental Rating",
        "questions": "Questions"
      },
      "strength_clusters": {
        "index_sub_factors_considered": "Thriving Index sub-factors that have been considered to provide your final score for the %{workstyle} work environment",
        "possible_roles": "Possible Roles",
        "work_environments": "Expected Work Environments"
      },
      "three_sixty_default": {
        "factor": {
          "items": "Items",
          "max": "Max Value",
          "mean": "Mean",
          "min": "Min Value",
          "standardDeviation": "Standard Deviation",
          "sum": "Sum",
          "totalResponses": "Total Responses",
          "variance": "Variance",
          "weightedMean": "Weighted Mean"
        },
        "statistic": "Statistic",
        "value": "Value"
      },
      "three_sixty_report_summary": {
        "number_by_filter_evaluations_received": "Number of %{filter} evaluations received",
        "number_of_evaluators_invited": "Number of evaluators invited",
        "number_of_evaluators_received": "Number of evaluations received",
        "number_of_evaluators_responded": "Number of evaluators responded",
        "subject": "Subject",
        "total_evaluations": "Total evaluations for this assessment"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Report"
    },
    "statuses": {
      "approved": "Approved",
      "available": "Available",
      "denied": "Denied",
      "incomplete": "Incomplete",
      "not_available": "Not available",
      "on_hold": "On hold"
    }
  },
  "simple_form": {
    "error_notification": {
      "default_message": "Please review the problems below:"
    },
    "labels": {
      "client": {
        "account_manager": "TTE Account Manager",
        "account_manager_id": "TTE Account Manager",
        "applicable_level": "Applicable Level",
        "applicable_levels": {
          "campaign": "Campaign",
          "project": "Project",
          "sub_campaign": "Sub-Campaign"
        },
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License Expiry Date",
        "licenses_used": "License Usage",
        "location": "Location",
        "logo": "Client logo",
        "memberships_count": "Users",
        "name": "Name",
        "number": "Client Number",
        "privacy_consent": "Enable data processing consent",
        "project_manager": "TTE Project Manager",
        "project_manager_id": "TTE Project Manager",
        "report_ids": "Reports",
        "subdomain": "Subdomain",
        "types": {
          "associate": "Associate",
          "corporate": "Corporate",
          "distributer": "Distributer",
          "other": "Other",
          "partner": "Partner",
          "retail": "Retail",
          "tte": "TTE"
        },
        "updated_at": "Modified Date",
        "year": "Client Year"
      },
      "membership": {
        "role": "Membership role"
      }
    },
    "no": "No",
    "placeholders": {
      "administration/assessments/assign_form": {
        "access_reports": "Access Report Rules",
        "access_reports_at": "Access Report at",
        "access_reports_at_date": "Date",
        "access_reports_at_time": "Time",
        "client_ids": "Client Tenancies",
        "manager_ids": "Managers",
        "report_ids": "Reports",
        "user_ids": "Users"
      },
      "administrator": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Client Tenancy",
        "memberships": "Client Tenancy",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "admins": {
            "admin": "Admin",
            "project_admin": "Project Admin",
            "regular": "Client Admin",
            "superadmin": "Super Admin"
          },
          "manager": "Manager",
          "member": "User",
          "regular": "Regular",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      },
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "case_study": "Case Studies",
          "hogan": "Hogan",
          "mindmill": "Mindmill",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "completed_at": "Completion Date",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "statuses": {
          "completed": "Completed",
          "finished": "finished",
          "in_progress": "Resume",
          "not_started": "New",
          "overdue": "Overdue"
        },
        "timing": "Timing",
        "types": {
          "common": "TTE Assessment",
          "hogan": "Hogan",
          "mindmill": "Mindmill Assessment"
        },
        "updated_at": "Modified Date"
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "account_manager": "TTE Account Manager",
        "account_manager_id": "TTE Account Manager",
        "applicable_level": "Applicable Level",
        "applicable_levels": {
          "campaign": "Campaign",
          "project": "Project",
          "sub_campaign": "Sub-Campaign"
        },
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License Expiry Date",
        "licenses_used": "License Usage",
        "location": "Location",
        "logo": "Client logo",
        "memberships_count": "Users",
        "name": "Name",
        "number": "Client Number",
        "privacy_consent": "Enable data processing consent",
        "project_manager": "TTE Project Manager",
        "project_manager_id": "TTE Project Manager",
        "report_ids": "Reports",
        "subdomain": "Subdomain",
        "types": {
          "associate": "Associate",
          "corporate": "Corporate",
          "distributer": "Distributer",
          "other": "Other",
          "partner": "Partner",
          "retail": "Retail",
          "tte": "TTE"
        },
        "updated_at": "Modified Date",
        "year": "Client Year"
      },
      "communication": {
        "created_at": "Created Date",
        "id": "ID",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. of Questions",
        "subfactors_count": "No. of Sub-Factors",
        "updated_at": "Modified Date"
      },
      "library": {
        "created_at": "Created Date",
        "id": "ID",
        "type": "Thumbnail",
        "updated_at": "Modified Date"
      },
      "license": {
        "id": "ID",
        "number": "License Number",
        "overuse_number": "Over Use Allowance",
        "type": "License for",
        "unlimited": "Unlimited",
        "used_number": "Used License Number"
      },
      "memebrship": {
        "active": "Active",
        "created_at": "Created Date",
        "disabled": "Disable",
        "email": "Email",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "parent": "Direct Manager",
        "parent_id": "Direct Manager",
        "report_ids": "Report IDs",
        "roles": {
          "client_admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "project_admin": "Project Admin"
        },
        "updated_at": "Modified Date",
        "user_access": "User Access"
      },
      "norm": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "description_label": "DESCRIPTION",
        "diploma_qualification": "Diploma Qualification",
        "factor_id": "Competency",
        "factor_id_label": "SELECT COMPETENCY",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "membership_id": "Assigner",
        "membership_id_label": "SELECT ASSIGNER",
        "name": "Name",
        "name_label": "ACTION ITEM",
        "planned_completed_at": "Due Date",
        "planned_completed_at_label": "SELECT DUE DATE",
        "potential_areas_of_study": "Potential Areas of Study",
        "priority": "Priority",
        "priority_label": "PRIORITY",
        "status": "Status",
        "status_label": "SELECT STATUS",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "Not Started",
          "overdue": "Overdue"
        },
        "updated_at": "Modified Date",
        "updated_by": "Edited by",
        "work_environment": "Work Environment"
      },
      "product": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "regenerate_reports": {
        "report_ids": "Reports"
      },
      "report": {
        "created_at": "Created Date",
        "id": "ID",
        "mindmill": "Load report from Mindmill",
        "mindmill_report": "Mindmill report",
        "updated_at": "Modified Date"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Client Tenancy",
        "memberships": "Client Tenancy",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "admins": {
            "admin": "Admin",
            "project_admin": "Project Admin",
            "regular": "Client Admin",
            "superadmin": "Super Admin"
          },
          "manager": "Manager",
          "member": "User",
          "regular": "Regular",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      },
      "user_form": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "parent": "Direct Manager",
        "parent_id": "Direct Manager",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "updated_at": "Modified Date"
      }
    },
    "required": {
      "mark": "*",
      "text": "required"
    },
    "yes": "Yes"
  },
  "subjects": {
    "statuses": {
      "completed": "Completed",
      "done": "Done",
      "not_completed": "Not Completed"
    }
  },
  "support": {
    "array": {
      "last_word_connector": ", and ",
      "two_words_connector": " and ",
      "words_connector": ", "
    }
  },
  "threesixty": {
    "add": "Add",
    "and": "And",
    "approve_all": "Approve All",
    "approve_all_successful": "Approved all nominations",
    "approve_evaluations": "Approve Evaluations",
    "approve_nominations": "Approve Nominations",
    "approve_reports": "Approve Reports",
    "approved": "Approved",
    "approving_mail_sent": "Mail for approving nomination has been sent to managers",
    "as_my": "as my",
    "back_to_tasks": "Back to tasks",
    "cancel": "Cancel",
    "decline": "Decline",
    "decline_invite": "Decline Invite",
    "denied": "Denied",
    "deny_all": "Deny All",
    "deny_all_successful": "Denied all nominations",
    "email_approve_request": "Email Approval Request",
    "evaluation": "Evaluation",
    "evaluations": "Evaluations",
    "help": {
      "evaluation": "<h2>Evaluations</h2> <p>There can be two different sections under Evaluations.</p> <h3>EVALUATIONS</h3> <p>Click on the person’s name to complete an evaluation of them.</p> <p>If you leave the page before you finish, you will be prompted to save.</p> <h3>APPROVE EVALUATIONS</h3> <p>This section only appears if you’re a Manager and have been given permission to approve your direct reports’ evaluations. An evaluation will not be added to the data in your direct report’s report until you approve.</p>\n<ol> <li><p>Navigate between your direct reports.</p></li> <li><p>Navigate between your direct reports’ evaluators.</p></li> <li><p>Change the status of the evaluation to <b>Approved</b>  or <b>Denied</b>.</p></li> </ol> <p>You can also download a PDF of the evaluation you’re reviewing.</p>",
      "main": "<h2>Help</h2> <p>need content for help modal</p>",
      "nomination": "<h2>Nominations</h2> <p>You either need to nominate people to evaluate you, nominate people to evaluate your direct reports, or approve your direct reports’ nominations.</p> <h3>SET UP NOMINATIONS</h3> <p>Sometimes, you will be asked to nominate coworkers you want to evaluate you.</p><ol> <li><p>To nominate an evaluator, type their name or email to find them. Then define their relationship to you. Click <b>Nominate Evaluator</b>  when finished.</p></li> <li><p>If your Manager is responsible for approving your nominations, remind them by clicking  <b>Email Approval Request</b> This option will not appear for everyone.</p></li> <li><p>Review the Approval and Evaluation status of your nominations.</p></li> <li><p>Remove a nomination by clicking the dropdown arrow and selecting <b>Remove</b>. This will not delete the data, but it will remove it from your report, and your evaluator won’t be able to retake this assessment.</p></li> </ol> <p>If you are a Manager, you may also be asked to nominate evaluators for your direct reports. In that case, the process will look the same.</p> <h3>APPROVE NOMINATIONS</h3> <p>If you are a Manager, you may be asked to approve the people your direct reports nominated to evaluate them. These evaluators will not be able to evaluate your direct report until you approve. Any email notifications set up will also not go out until the manager has approved a nomination.</p> <p>Approval technically takes place on the same screen where you’d set up your direct reports’ nominations, if you had that task.</p>​ <ol> <li><p>Click <b>Approve All</b>  to approve all nominations on the page.</p></li> <li><p>Click <b>Deny All</b>  to deny all nominations on the page.</p></li> <li><p>Click the dropdown next to a particular nomination to approve or deny just that nomination. <b>Waiting</b> means you haven’t made a decision yet.</p></li> </ol>",
      "report": "<h2>Report</h2> <p>There can be two different sections under Report.</p> <h3>VIEW REPORT</h3> <p>Here, you can view any reports you have access to. For most people, this is just their own.</p> <ol> <li><p>Change whose report you’re viewing.</p></li> <li><p>Determine if you are viewing the report as a subject or Manager.</p></li> <li><p>Click the arrow to download your report. If you click the dropdown menu, you can also select <b>Download All Reports</b>  to download all the reports you have access to. All downloads are in PDF format.</p></li> <li><p>Click the email icon to send a copy of the report to the email associated with your login.</p></li> </ol> <h3>APPROVE REPORTS</h3> <p>If you are a Manager, you may be asked to approve reports. Your direct report will not see their report until you approve it.</p> <p>On this page, you can switch between subject and Manager views, download, and email these reports just as your would your own, with a few differences.</p> <ol> <li><p>Navigate between direct reports.</p></li> <li><p><b>Deny</b>  the report release.</p></li> <li><p>Approve the report for release.</p></li> </ol>"
    },
    "language": "Language",
    "my_projects": "My Projects",
    "nominate": "Nominate",
    "nominate_evaluators": "Nominate Evaluators to",
    "nomination": "Nomination",
    "nominations": "Nominations",
    "or": "Or",
    "page_title": "Signify 360° Review - Apply Level",
    "remind_all": "Remind All",
    "remind_mail_sent": "Reminders sent to evaluators who haven't completed the evaluation",
    "reports": "Reports",
    "select_relationnship": "Select Relationship",
    "select_relationship": "Select Relationship",
    "setup_nominations": "Set up nominations",
    "total_progress": "Total progress",
    "user_name_input_placeholder": "type name or email...",
    "validation_errors": "Validation Errors",
    "view_nominations": "View nominations",
    "waiting": "Waiting"
  },
  "time": {
    "am": "am",
    "formats": {
      "date": "%d/%m/%y",
      "datetimepicker_client": "DD/MM/YYYY hh:mm A",
      "datetimepicker_server": "%d/%m/%Y %I:%M %p",
      "datetimepicker_without_time_client": "DD/MM/YYYY",
      "datetimepicker_without_time_server": "%d/%m/%Y",
      "default": "%a, %d %b %Y %H:%M:%S %z",
      "devise": {
        "mailer": {
          "invitation_instructions": {
            "accept_until_format": "%B %d, %Y %I:%M %p"
          }
        }
      },
      "iso8601_without_seconds_and_timezone": "%Y-%m-%dT%H:%M",
      "long": "%B %d, %Y %H:%M",
      "short": "%d %b %Y / %H:%M",
      "short_date": "%-d %b %Y"
    },
    "pm": "pm"
  },
  "validations": {
    "character_range": "يجب أن تتكون إجابتك من  %{min} حرفاً كحد أدنى وألا تزيد عن %{max} حرفًا كحد أقصى.",
    "date": "(dd/mm/yyyy) يجب أن يتم إدخال تاريخ صحيح",
    "each_group_contains": "يجب أن تحتوي كل مجموعة على  %{min} عنصر كحد أدنى ولا تزيد عن %{max} كحد أقصى",
    "email": "البريد الإلكتروني غير صحيح",
    "issue": " الخطأ",
    "least": "الرجاء اختيار %{min} خيارات كحد أدنى.",
    "least_hotspot": "الرجاء اختيار %{min} خيارات كحد أدنى.",
    "max_length": " يجب ألا تتجاوز إجابتك %{max} حرفًا.",
    "min_length": "يجب أن تتكون إجابتك من  %{min} حرفًا كحد أدنى. ",
    "must_rank_between": " يرجى وضع قيمة من %{min} إلى %{max} لكل عنصر. لا يجب أن تتكرر القيم.",
    "must_select": "الرجاء اختيار من  %{min} إلى %{max} من الاختيارات",
    "number": "يجب أن تحتوي الإجابة على أرقام",
    "please_answer_question": "الرجاء الإجابة على هذا السؤال",
    "please_record_and_save_video_first": "Please record and save the video before you continue",
    "range": "الرجاء الإجابة عن  %{min} كحد أدنى و  %{max} كحد أقصى من الخيارات. ",
    "text": "يجب ألا تحتوي إجابتك على أرقام",
    "title": " عذرًا، لا يمكنك المتابعة حتى تقوم بتصحيح ما يلي: "
  },
  "views": {
    "pagination": {
      "first": "&laquo; First",
      "last": "Last &raquo;",
      "next": "Next &rsaquo;",
      "previous": "&lsaquo; Prev",
      "truncate": "&hellip;"
    }
  },
  "yes": "Yes"
});
I18n.translations["ms"] = I18n.extend((I18n.translations["ms"] || {}), {
  "activemodel": {
    "attributes": {
      "assign_report": {
        "adding_report_ids": "Report(s)",
        "is_applying_to_existing_users": "Apply these changes to existing users",
        "report_family_id": "Report Bundle"
      },
      "datasheet": {
        "file": "File (.xlsx)"
      },
      "new_assessments_client": {
        "assessment_ids": "Assessments",
        "is_applying_to_existing_users": "Apply these changes to existing users"
      },
      "regenerate_reports": {
        "report_ids": "Reports"
      },
      "update_assessment": {
        "is_applying_to_existing_users": "Apply these changes to existing users"
      }
    },
    "errors": {
      "models": {
        "assign_report": {
          "attributes": {
            "adding_report_ids": {
              "not_linked_to_report_family": "You selected Reports which are not linked to selected Report Bundle",
              "report_family_disabled": "You selected disabled Report Bundle",
              "reports_disabled": "You selected disabled Report(s)"
            },
            "removing_report_ids": {
              "not_linked_to_report_family": "You selected Reports which are not linked to selected Report Bundle"
            }
          }
        },
        "create_all": {
          "attributes": {
            "evaluators": {
              "email_duplicated": "The subject and evaluator emails are duplicated"
            },
            "subjects": {
              "email_duplicated": "Some subjects have the same email"
            }
          }
        },
        "create_one": {
          "attributes": {
            "email": {
              "already_exists": "A subject with same email already exists",
              "blank": "Email can't be blank",
              "invalid": "Email is invalid"
            },
            "evaluator_email": {
              "already_exists": "The subject with this evaluator are already connected",
              "blank": "Evaluator Email can't be blank",
              "invalid": "Evaluator Email is invalid"
            },
            "evaluator_first_name": {
              "blank": "Evaluator first name can't be blank"
            },
            "evaluator_last_name": {
              "blank": "Evaluator last name can't be blank"
            },
            "first_name": {
              "blank": "First name can't be blank"
            },
            "last_name": {
              "blank": "Last name can't be blank"
            },
            "relationship_name": {
              "blank": "Relationship can't be blank",
              "invalid": "Relationship %{name} is invalid"
            },
            "subject_email": {
              "blank": "Subject Email can't be blank",
              "invalid": "Subject Email is invalid",
              "not_exists": "Subject not found with email address %{email}"
            }
          }
        },
        "datasheet": {
          "attributes": {
            "file": {
              "email_duplicate": "There are duplicates in Email column",
              "invalid_format": "Invalid format (.xlsx)",
              "no_email_column": "File does not contain Email column"
            }
          }
        },
        "email_schedule": {
          "attributes": {
            "from": {
              "blank": "From field can't be blank"
            },
            "reply_to_email": {
              "blank": "Reply to email field can't be blank",
              "invalid": "Reply to email is invalid"
            },
            "scheduled_date": {
              "blank": "Scheduled date field can't be blank"
            }
          }
        },
        "email_template": {
          "attributes": {
            "from": {
              "blank": "From field can't be blank"
            },
            "reply_to_email": {
              "blank": "Reply to email field can't be blank",
              "invalid": "Reply to email is invalid"
            }
          }
        },
        "email_template_test_mail": {
          "attributes": {
            "to_email": {
              "blank": "Email field can't be blank",
              "invalid": "Email is invalid"
            }
          }
        },
        "import_one": {
          "attributes": {
            "email": {
              "already_exists": "A subject with same email already exists",
              "blank": "Email can't be blank",
              "invalid": "Email is invalid"
            },
            "first_name": {
              "blank": "First name can't be blank"
            },
            "last_name": {
              "blank": "Last name can't be blank"
            },
            "password": {
              "too_short": "Password is too short. Minimum 6 character required"
            }
          }
        },
        "profile": {
          "attributes": {
            "first_name": {
              "blank": "First name can't be blank"
            },
            "last_name": {
              "blank": "Last name can't be blank"
            },
            "password": {
              "too_short": "Password is too short. Minimum 6 character required"
            }
          }
        },
        "update_assessment": {
          "attributes": null
        }
      }
    },
    "models": {
      "assign_report": "Assign report Form",
      "datasheet": "Datasheet Form",
      "regenerate_reports": "Regenerate Reports",
      "update_assessment": "Update assessment Form"
    }
  },
  "activerecord": {
    "attributes": {
      "administration/assessments/assign_form": {
        "access_reports": "Access Report Rules",
        "access_reports_at": "Access Report at",
        "access_reports_at_date": "Date",
        "access_reports_at_time": "Time",
        "client_ids": "Client Tenancies",
        "manager_ids": "Managers",
        "report_ids": "Reports",
        "user_ids": "Users"
      },
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "case_study": "Case Studies",
          "hogan": "Hogan",
          "mindmill": "Mindmill",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "statuses": {
          "finished": "finished"
        },
        "timing": "Timing",
        "types": {
          "common": "TTE Assessment",
          "hogan": "Hogan",
          "mindmill": "Mindmill Assessment"
        },
        "updated_at": "Modified Date"
      },
      "assign": {
        "completed_at": "Completion Date",
        "statuses": {
          "completed": "Completed",
          "in_progress": "Resume",
          "not_started": "New",
          "overdue": "Overdue"
        }
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "account_manager": "TTE Account Manager",
        "account_manager_id": "TTE Account Manager",
        "applicable_level": "Applicable Level",
        "applicable_levels": {
          "campaign": "Campaign",
          "project": "Project",
          "sub_campaign": "Sub-Campaign"
        },
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License Expiry Date",
        "licenses_used": "License Usage",
        "location": "Location",
        "logo": "Client logo",
        "memberships_count": "Users",
        "name": "Name",
        "number": "Client Number",
        "privacy_consent": "Enable data processing consent",
        "project_manager": "TTE Project Manager",
        "project_manager_id": "TTE Project Manager",
        "report_ids": "Reports",
        "subdomain": "Subdomain",
        "types": {
          "associate": "Associate",
          "corporate": "Corporate",
          "distributer": "Distributer",
          "other": "Other",
          "partner": "Partner",
          "retail": "Retail",
          "tte": "TTE"
        },
        "updated_at": "Modified Date",
        "year": "Client Year"
      },
      "communication": {
        "created_at": "Created Date",
        "id": "ID",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. of Questions",
        "subfactors_count": "No. of Sub-Factors",
        "updated_at": "Modified Date"
      },
      "hogan_report_setting": {
        "load_report": "Load report from Hogan"
      },
      "library": {
        "created_at": "Created Date",
        "id": "ID",
        "type": "Thumbnail",
        "updated_at": "Modified Date"
      },
      "membership": {
        "active": "Active",
        "created_at": "Created Date",
        "disabled": "Disable",
        "email": "Email",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "parent": "Direct Manager",
        "parent_id": "Direct Manager",
        "report_ids": "Report IDs",
        "roles": {
          "client_admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "project_admin": "Project Admin"
        },
        "updated_at": "Modified Date",
        "user_access": "User Access"
      },
      "norm": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "occupation": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "diploma_qualification": "Diploma Qualification",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "name": "Name",
        "potential_areas_of_study": "Potential Areas of Study",
        "updated_at": "Modified Date",
        "work_environment": "Work Environment"
      },
      "occupations_factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "product": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "report": {
        "created_at": "Created Date",
        "id": "ID",
        "mindmill": "Load report from Mindmill",
        "mindmill_report": "Mindmill report",
        "updated_at": "Modified Date"
      },
      "report_family": {
        "created_at": "Created Date",
        "id": "ID",
        "updated_at": "Modified Date"
      },
      "task": {
        "active": "Active",
        "created_at": "Created Date",
        "description": "Description",
        "description_label": "DESCRIPTION",
        "factor_id": "Competency",
        "factor_id_label": "SELECT COMPETENCY",
        "id": "ID",
        "membership_id": "Assigner",
        "membership_id_label": "SELECT ASSIGNER",
        "name": "Action Item",
        "name_label": "ACTION ITEM",
        "planned_completed_at": "Due Date",
        "planned_completed_at_label": "SELECT DUE DATE",
        "priority": "Priority",
        "priority_label": "PRIORITY",
        "status": "Status",
        "status_label": "SELECT STATUS",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "Not Started",
          "overdue": "Overdue"
        },
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Client Tenancy",
        "memberships": "Client Tenancy",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "remember_me": "Remember me",
        "reset_password_token": "Reset password token",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "admins": {
            "admin": "Admin",
            "project_admin": "Project Admin",
            "regular": "Client Admin",
            "superadmin": "Super Admin"
          },
          "manager": "Manager",
          "member": "User",
          "regular": "Regular",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "unlock_token": "Unlock token",
        "updated_at": "Modified Date"
      },
      "user_form": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "parent": "Direct Manager",
        "parent_id": "Direct Manager",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "updated_at": "Modified Date"
      }
    },
    "errors": {
      "messages": {
        "admin_for_another_tte": "User already admin in another tte",
        "not_uniqueness": "Assign has already been taken",
        "record_invalid": "Validation failed: %{errors}",
        "restrict_dependent_destroy": {
          "has_many": "Cannot delete record because dependent %{record} exist",
          "has_one": "Cannot delete record because a dependent %{record} exists"
        }
      },
      "models": {
        "factors_norm": {
          "score_from_must_be_number": "Score from must be number",
          "score_to_less_than_score_from": "Score to is less than Score from",
          "score_to_must_be_number": "Score to must be number"
        },
        "license": {
          "overuse": "License %{name} ssis overused"
        },
        "report": {
          "assessments_not_hogan": "All Assessments must be Hogan type",
          "has_already_assigned": "Assessment can’t be changed since it is already assigned to the user or applicable level",
          "has_dependent_relation": "This report is assinged on users",
          "max_assessment_count": "You have reached the limit of %{max} assessments",
          "min_assessment_count": "The minimum number of assessments is %{min}"
        }
      }
    },
    "models": {
      "administration/assessments/assign_form": "Assigns Form",
      "assessment": "Assessments",
      "assign": "Assigns",
      "block": "Block",
      "client": "Clients",
      "communication": "Communication",
      "dimension": "Dimensions",
      "factor": "Factors",
      "factors_norm": "factors_norms",
      "library": "Library",
      "membership": "Membership",
      "norm": "Norms",
      "occupation": "Occupations",
      "occupations_factor": "Occupations",
      "product": "Product",
      "question": "Question",
      "report": "Report",
      "report_family": "ReportFamily",
      "task": "Tasks",
      "user": "Users",
      "user_form": "User"
    }
  },
  "administration": {
    "actions": "Actions",
    "active": "Active",
    "administrator": {
      "invitations": {
        "edit": {
          "confirm_password_label": "Confirm Password",
          "description": "To create a new password, please enter your new password in the boxes below.",
          "password_label": "Password",
          "submit": "Set New Password",
          "title": "Create password"
        }
      },
      "passwords": {
        "edit": {
          "confirm_password_label": "Confirm Password",
          "description": "To create a new password, please enter your new password in the boxes below.",
          "password_label": "Password",
          "submit": "Set New Password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "description": "Please enter your email address in the box below and click 'Reset Password'.",
          "email_label": "Email Address",
          "submit": "Reset Password",
          "title": "Forgotten Password"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "password_placeholder": "Enter your password",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": " Contact Us",
          "faqs": " FAQs",
          "privacy": "Privacy Statement",
          "terms_conditions": " Terms & Conditions"
        }
      }
    },
    "all": " - All - ",
    "any": " - Any - ",
    "assessments": {
      "assigns": {
        "create": {
          "successfully": "You successfully finished assigning %{name}"
        },
        "form": {
          "empty_client_ids": "Select clients to continue"
        },
        "new": {
          "help_block": "Select Clients and then click to the button \"Load Form\"",
          "load_form": "Load Form",
          "title": "Assign %{name} Assessment"
        },
        "users": {
          "filter": "Filter",
          "filter_form": "Filter form",
          "not_selected_users": "Not Selected Users",
          "selected_users": "Selected Users"
        }
      },
      "copy": {
        "error": "Assessment #%{name} was not copied.",
        "successfully": "Assessment %{name} was Copied Successfully."
      },
      "create": {
        "successfully": "Assessment %{name} was Created Successfully."
      },
      "dashboard": "Assessment Dashboard",
      "destroy": {
        "successfully": "Assessment %{name} was Destroyed Successfully."
      },
      "edit": {
        "header": "Assessment Settings"
      },
      "form": {
        "categories": {
          "360": "360 Feedback",
          "all": "All Categories",
          "case_study": "Case Studies",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "timing": {
          "hint": "For Example: 30 minutes to complete"
        }
      },
      "index": {
        "filterrific": {
          "with_category": {
            "360": "360 Feedback",
            "all": "All Categories",
            "case_study": "Case Studies",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "new": "Add",
        "owner": "Owner",
        "title": "Assessments",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New assessment"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
            "title": "Delete <strong>Assessment</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Assessment",
          "delete": "Delete Assessment",
          "edit": "Edit Assessment"
        }
      },
      "sidebar": {
        "assign": "Assign Assessment",
        "builder": "Questions Builder",
        "copy": "Copy Assessment",
        "destroy": "Delete Assessment",
        "disable": "Disable",
        "edit": "Assessment Settings",
        "enable": "Enable",
        "export": "Export Scoring",
        "new": "New Assessment",
        "preview": "Preview Assessment",
        "title": "Assessment's options"
      },
      "toggle_status": {
        "successfully": "Assessment %{name} was Updated Successfully."
      },
      "update": {
        "successfully": "Assessment %{name} was Updated Successfully."
      }
    },
    "assigns": {
      "create": {
        "successfully": "New assign to assessment was successfully created"
      },
      "destroy": {
        "successfully": "Assign to assessment was successfully deleted"
      },
      "index": {
        "title": "Reports"
      },
      "new": {
        "header": "Assign Assessment and Reports"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this assign?</p>",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        }
      }
    },
    "assigns_reports": {
      "edit": {
        "header": "Edit report assignment"
      }
    },
    "back": "Back",
    "base": {
      "top_sidebar": {
        "search": "Search...",
        "sign_out_message": {
          "body": "<p>Are you sure you want to log out?</p> <p>Press No if you want to continue work. Press Yes to logout current user.</p>",
          "title": "Log <strong>Out</strong> ?"
        }
      }
    },
    "blocks": {
      "destroy": {
        "successfully": "Block %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Block"
      },
      "new": {
        "header": "New Block"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Block?</p>\n",
            "title": "Delete <strong>Block</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Block?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "breadcrumbs": {
      "admins": "Admins",
      "assessments": "Assessments",
      "campaign_templates": "Campaign Templates",
      "campaigns": "Campaigns",
      "client": "Client Tenancy",
      "client_admins": "Client Admins",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "datasheets": "Datasheets",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "licenses": "Licenses",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "products": "Products",
      "project_admins": "Project Admins",
      "projects": "Projects",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "report_families": "Report Bundles",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_campaigns": "Sub Campaigns",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "bulk_reports": {
      "create": {
        "no_data": "No data is available for the report type and time range specified",
        "successfully": "The reports are being created and you will be notified via email when ready"
      },
      "download": {
        "removed": "Sorry, the file has been removed from the system after one week of storage"
      },
      "mailer": {
        "subject": "Download bulk reports"
      },
      "new": {
        "header": "Bulk Download"
      }
    },
    "cable": {
      "notification": {
        "assessment_factors": "Factors are fetched",
        "assessment_update": "Assessment is updated",
        "block_clone": "Block is copied",
        "block_create": "Block %{name} is created",
        "block_create_by_template": "Block was loaded from template",
        "block_destroy": "Block has been deleted",
        "block_move_down": "Block %{name} is moved down",
        "block_move_up": "Block %{name} is moved up",
        "block_permanent_destroy": "Block is permanently deleted",
        "block_rename": "Block is renamed",
        "block_restore": "Block is restored",
        "block_save_as_template": "Block saved as template",
        "block_unlink_template": "Block was unlinked",
        "block_update": "Block is updated",
        "comment_create": "Comment is created",
        "comment_destroy": "Comment has been deleted",
        "geo_filter": "Data filtered",
        "module_create": "Module %{name} is created",
        "module_destroy": "Module has been deleted",
        "module_insert_after": "Module is inserted after",
        "module_insert_before": "Module is inserted before",
        "module_move_down": "Module is moved down",
        "module_move_up": "Module is moved up",
        "module_rename": "Module is renamed",
        "module_update": "Module is updated",
        "page_create": "Page %{name} is created",
        "page_destroy": "Page has been deleted",
        "page_move_down": "Page %{name} is moved down",
        "page_move_up": "Page %{name} is moved up",
        "page_rename": "Page is renamed",
        "page_update": "Page is updated",
        "question_clone": "Question is copied",
        "question_create": "Question %{name} is created",
        "question_create_by_template": "Question was loaded from template",
        "question_create_from_template": "Question is created from template",
        "question_destroy": "Question has been deleted",
        "question_insert_after": "Question is inserted after",
        "question_insert_before": "Question is inserted before",
        "question_move_down": "Question is moved down",
        "question_move_up": "Question is moved up",
        "question_permanent_destroy": "Question is permanently deleted",
        "question_rename": "Question is renamed",
        "question_restore": "Question is restored",
        "question_save_as_template": "Question saved as template",
        "question_unlink_template": "Question was unlinked",
        "question_update": "Question is updated",
        "report_change_aliases": "Aliases are updated",
        "report_change_data_configuration": "Data Report Configuration was successfully updated",
        "report_change_filters": "Filters are updated",
        "report_update": "Report is updated",
        "scoring_update": "Scoring is updated",
        "trash_empty": "Trash Comment empty"
      }
    },
    "campaign_templates": {
      "base": {
        "active": "Active",
        "archived": "Archived",
        "disable": "Archive",
        "enable": "Unarchive"
      },
      "copy": {
        "error": "Client Tenancy %{name} was not copied.",
        "successfully": "Client Tenancy %{name} was successfully copied."
      },
      "create": {
        "successfully": "Client Tenancy %{name} was successfully created."
      },
      "designs": {
        "form": {
          "no_background": "No Background yet",
          "no_logo": "No Logo yet"
        }
      },
      "destroy": {
        "successfully": "Client Tenancy %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Client"
      },
      "export": {
        "admin": "Client Admin",
        "client_admins": "Client Admins",
        "report_bundle": "Report Bundle"
      },
      "index": {
        "export": "Export",
        "new": "Add",
        "title": "Campaign Templates"
      },
      "license": {
        "header": "%{name} - Edit license"
      },
      "licenses": {
        "update": {
          "duplicate_licenses": "You have duplicate licenses",
          "successfully": "Licenses successfully updated"
        }
      },
      "list": {
        "admin": "Client Admin",
        "client_admins": "Client Admins",
        "report_bundle": "Report Bundle"
      },
      "new": {
        "header": "New Client"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": {
              "0": "<p>Are you sure you want to delete?</p> <p>All Campaigns, Sub-campaigns and users will also be deleted</p>",
              "1": "<p>Are you sure you want to delete?</p> <p>All Sub-campaigns and users will also be deleted</p>",
              "2": "<p>Are you sure you want to delete?</p> <p>All users will also be deleted</p>"
            },
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "disable": {
            "body": {
              "0": "<p>Are you sure you want to archive?</p> <p>All Campaigns, Sub-campaigns and users will also be archived</p>",
              "1": "<p>Are you sure you want to archive?</p> <p>All Sub-campaigns and users will also be archived</p>",
              "2": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>",
              "3": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>"
            },
            "title": "Archive <strong>%{name}</strong> ?"
          },
          "enable": {
            "body": {
              "0": "<p>Are you sure you want to unarchive?</p>",
              "1": "<p>Are you sure you want to unarchive?</p>",
              "2": "<p>Are you sure you want to unarchive?</p>",
              "3": "<p>Are you sure you want to unarchive?</p>"
            },
            "title": "Unarchive <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Client",
          "create_admin": "Create Client Admin",
          "delete": "Delete Client",
          "disable": "Disable Client",
          "edit": "Edit Client",
          "enable": "Enable Client"
        }
      },
      "sidebar": {
        "copy": "Copy Client",
        "design": "Edit Design",
        "destroy": "Delete Client",
        "disable": "Disable",
        "edit": "Edit Client",
        "enable": "Enable",
        "licenses": "Manage Licenses",
        "new": "New Client",
        "title": "Campaign options"
      },
      "toggle_status": {
        "successfully": "Client Tenancy %{name} was successfully updated."
      },
      "update": {
        "successfully": "Client Tenancy %{name} was successfully updated."
      },
      "url": "Url"
    },
    "choose": " - Choose - ",
    "clear": "Clear",
    "clients": {
      "api_keys": {
        "create": {
          "successfully": "New API key was successfully created."
        },
        "index": {
          "breadcrumb": "%{name}'s API keys",
          "new": "Create new API key",
          "title": "%{name}'s API keys"
        },
        "list": {
          "active": "Active",
          "created_at": "Created",
          "key": "Key",
          "token": "Token",
          "updated_at": "Last modified"
        },
        "resource": {
          "confirmations": {
            "create": {
              "body": "<p>Are you sure you want to create a new API key?</p>\n",
              "title": "<strong>Create</strong> a new API key?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this API key?</p>\n",
              "title": "<strong>%{status}</strong> API key?"
            }
          },
          "copy": "Copy",
          "show_and_copy": "Show and Copy"
        },
        "toggle_status": {
          "successfully": "API key was successfully updated."
        }
      },
      "assessments": {
        "assigns": {
          "form": {
            "empty_client_ids": "Select clients to continue"
          }
        },
        "copy": {
          "error": "Assessment #%{name} was not copied.",
          "successfully": "Assessment %{name} was Copied Successfully."
        },
        "create": {
          "successfully": "Assessment %{name} was Created Successfully."
        },
        "dashboard": "Assessment Dashboard",
        "destroy": {
          "successfully": "Assessment %{name} was Destroyed Successfully."
        },
        "edit": {
          "header": "Assessment Settings"
        },
        "form": {
          "categories": {
            "360": "360 Feedback",
            "all": "All Categories",
            "case_study": "Case Studies",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          },
          "timing": {
            "hint": "For Example: 30 minutes to complete"
          }
        },
        "index": {
          "filterrific": {
            "with_category": {
              "360": "360 Feedback",
              "all": "All Categories",
              "case_study": "Case Studies",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "new": "Add",
          "owner": "Owner",
          "title": "Assessments",
          "tooltips": {
            "create": "Create"
          }
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New assessment"
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
              "title": "Delete <strong>Assessment</strong> ?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "export_results": "Export results",
          "normed_results": "Normed results",
          "raw_results": "Raw results",
          "scoring_results": "Scoring results",
          "tooltips": {
            "copy": "Copy Assessment",
            "delete": "Delete Assessment",
            "edit": "Edit Assessment"
          }
        },
        "sidebar": {
          "assign": "Assign Assessment",
          "builder": "Questions Builder",
          "copy": "Copy Assessment",
          "destroy": "Delete Assessment",
          "disable": "Disable",
          "edit": "Assessment Settings",
          "enable": "Enable",
          "export": "Export Scoring",
          "new": "New Assessment",
          "preview": "Preview Assessment",
          "title": "Assessment's options"
        },
        "toggle_status": {
          "successfully": "Assessment %{name} was Updated Successfully."
        },
        "update": {
          "successfully": "Assessment %{name} was Updated Successfully."
        }
      },
      "assign_assessments": {
        "confirm_remove_dependent_reports": {
          "body": "Removing assessment(s) will also remove the following reports: %{report_names}",
          "title": "Are you sure want to remove <b>Assessments</b>?"
        },
        "edit": {
          "header": "Manage assigned Assessments"
        },
        "form": {
          "apply_to_existing_users_hint": "(If is not selected, changes will be applied only to new users)"
        },
        "form_edit": {
          "apply_to_existing_users_hint": "(If is not selected, changes will be applied only to new users)",
          "name": "Assessment name",
          "remove": "Remove"
        },
        "new": {
          "header": "Add Assessments"
        }
      },
      "assign_reports": {
        "edit": {
          "header": "Add Reports"
        },
        "form": {
          "access": "Access",
          "apply_to_existing_users_hint": "(If is not selected, changes will be applied only to new users)",
          "reports": "Reports",
          "user_access": "User Access"
        },
        "form_edit": {
          "access": "Access",
          "added_reports": "Already assigned Reports",
          "apply_to_existing_users_hint": "(If is not selected, changes will be applied only to new users)",
          "new_reports": "Add new Reports",
          "remove": "Remove",
          "reports": "Reports",
          "user_access": "User Access"
        },
        "new": {
          "header": "Add Reports"
        }
      },
      "base": {
        "active": "Active",
        "archived": "Archived",
        "disable": "Archive",
        "enable": "Unarchive"
      },
      "campaigns": {
        "archive": {
          "successfully": "Campaign %{name} was successfully archived."
        },
        "copy": {
          "error": "Campaign %{name} was not copied.",
          "successfully": "Campaign %{name} was successfully copied."
        },
        "create": {
          "successfully": "Campaign %{name} was successfully created."
        },
        "destroy": {
          "successfully": "Campaign %{name} was successfully deleted."
        },
        "edit": {
          "header": "Edit Campaign"
        },
        "export": {
          "assigned_user": "Assigned Users",
          "completed_user": "Completed Users",
          "header": {
            "actions": "Actions",
            "actual_usage": "Actual Usage",
            "campaigns": "Campaigns",
            "name": "Name",
            "sub_campaign": "Sub-Campaigns",
            "tests_allocated": "Tests Allocated",
            "users": "Users"
          },
          "name": "Campaign Name"
        },
        "index": {
          "export": "Export",
          "new": "Add",
          "title": "Campaigns"
        },
        "list": {
          "assigned_user": "Assigned Users",
          "completed_user": "Completed Users",
          "header": {
            "actions": "Actions",
            "actual_usage": "Actual Usage",
            "campaigns": "Campaigns",
            "name": "Name",
            "sub_campaign": "Sub-Campaigns",
            "tests_allocated": "Tests Allocated",
            "users": "Users"
          },
          "name": "Campaign Name"
        },
        "new": {
          "header": "New Campaign"
        },
        "resource": {
          "sub_campaign": {
            "create": "Create New Sub-Campaign"
          },
          "tooltips": {
            "copy": "Copy Campaign",
            "create_report": "Add New Report",
            "create_user": "Add New User",
            "delete": "Delete Campaign",
            "edit": "Edit Campaign",
            "export": "Export"
          }
        },
        "sidebar": {
          "archive": "Archive Campaign",
          "copy": "Copy Campaign",
          "destroy": "Delete Campaign",
          "disable": "Disable",
          "edit": "Edit Campaign",
          "enable": "Enable",
          "new": "New Campaign",
          "title": "Campaign's options"
        },
        "toggle_status": {
          "successfully": "Campaign %{name} was successfully updated."
        },
        "update": {
          "successfully": "Campaign %{name} was successfully updated."
        }
      },
      "client_admins": {
        "create": {
          "successfully": "User %{name} was successfully created."
        },
        "destroy": {
          "successfully": "User %{name} was successfully deleted."
        },
        "edit": {
          "add": "Add",
          "grants": "Privileges",
          "hris_data": "HRIS Data",
          "key": "Key",
          "personal_data": "Personal Data",
          "remove": "Remove",
          "title": "Edit user",
          "value": "Value"
        },
        "form": {
          "choose": " - Choose - ",
          "choose_admin": "Choose Admin",
          "create_admin": "Create Admin"
        },
        "index": {
          "breadcrumb": "Client Admins",
          "title": "Client Admins"
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New user"
        },
        "reset_password": {
          "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
        },
        "resource": {
          "confirmations": {
            "change_password": {
              "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
              "title": "Change password <strong>%{name}</strong> ?"
            },
            "delete": {
              "body": "<p>Are you sure you want to delete this User?</p>\n",
              "title": "Delete <strong>%{name}</strong> ?"
            },
            "membership": {
              "delete": {
                "body": "<p>Are you sure you want to delete?</p>\n",
                "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
              }
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this User?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "change_password": "Change Password",
            "chart": "View user report",
            "delete": "Delete User",
            "edit": "Edit User",
            "mail": "Send Mail",
            "sign_in": "Login as user"
          }
        },
        "sidebar": {
          "api_keys": "API keys",
          "assessments_and_reports": "Assessments and Reporting",
          "destroy": "Delete User",
          "disable": "Disable",
          "edit_user": "Edit User",
          "email": "Send Mail",
          "enable": "Enable",
          "export_users": "Export users",
          "import_users": "Import users",
          "login_as_user": "Login as User",
          "new_user": "New User",
          "reset_password": "Change Password",
          "title": "User's options"
        },
        "spoof": {
          "successfully": "You was successfully login as %{name}"
        },
        "toggle_status": {
          "successfully": "User %{name} was successfully updated."
        },
        "update": {
          "successfully": "User %{name} was successfully updated."
        }
      },
      "copy": {
        "error": "Client Tenancy %{name} was not copied.",
        "successfully": "Client Tenancy %{name} was successfully copied."
      },
      "create": {
        "successfully": "Client Tenancy %{name} was successfully created."
      },
      "datasheet_rows": {
        "create": {
          "successfully": "New Datasheet was successfully uploaded."
        },
        "destroy": {
          "successfully": "Datasheet Row %{name} was successfully deleted."
        },
        "index": {
          "new": "Upload datasheet",
          "title": "%{name} Datasheet"
        },
        "list": null,
        "new": {
          "header": "Upload datasheet"
        },
        "resource": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Datasheet Row?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "tooltips": {
            "delete": "Delete"
          }
        }
      },
      "designs": {
        "form": {
          "no_background": "No Background yet",
          "no_logo": "No Logo yet"
        }
      },
      "destroy": {
        "successfully": "Client Tenancy %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Client"
      },
      "export": {
        "admin": "Client Admin",
        "client_admins": "Client Admins",
        "report_bundle": "Report Bundle"
      },
      "index": {
        "export": "Export",
        "new": "Add",
        "title": "Client Tenancies"
      },
      "license": {
        "header": "%{name} - Edit license"
      },
      "license_usages": {
        "index": {
          "title": "Usage Details"
        },
        "list": {
          "campaign_name": "Campaign Name",
          "created_at": "Date",
          "id": "Usage ID",
          "subject_email": "Subject Email",
          "subject_name": "Subject Name"
        }
      },
      "licenses": {
        "create": {
          "successfully": "License was successfully created."
        },
        "edit": {
          "header": "Edit License"
        },
        "form": {
          "add_license": "Add Another License",
          "license_number": "License Number",
          "license_overuse_number": "Over Use Allowance",
          "report_family": "Report Bundle"
        },
        "index": {
          "new": "Add License",
          "report_family": "Report Bundle",
          "title": "%{client_name} - Manage Licenses"
        },
        "list": {
          "date_expire": "Date Of Expiry: %{date}",
          "end_date": "End Date",
          "header": "%{client_name} - Licenses Usage",
          "license_has_expired": "License package has expired",
          "license_type": "License Type",
          "report_family": "Report Bundle",
          "start_date": "Start Date",
          "usage_percent": "% of Usage",
          "used_license_number": "Used Licenses",
          "used_license_overuse_number": "Over Use Allowance",
          "used_out_of": "%{used_number} out of %{number}"
        },
        "mailer": {
          "license_expire": {
            "subject": "License expired"
          },
          "license_overuse": {
            "subject": "License overuse"
          }
        },
        "new": {
          "header": "Add License"
        },
        "overview": {
          "date_expire": "Date Of Expiry: %{date}",
          "end_date": "End Date",
          "header": "%{client_name} - Licenses Usage",
          "license_has_expired": "License package has expired",
          "license_type": "License Type",
          "report_family": "Report Bundle",
          "start_date": "Start Date",
          "usage_percent": "% of Usage",
          "used_license_number": "Used Licenses",
          "used_license_overuse_number": "Over Use Allowance",
          "used_out_of": "%{used_number} out of %{number}"
        },
        "resource": {
          "confirmations": {
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this License?</p>\n",
              "title": "<strong>%{status}</strong> License for %{name}?"
            }
          },
          "tooltips": {
            "edit": "Edit License"
          }
        },
        "show": {
          "date_expire": "Date Of Expiry: %{date}",
          "end_date": "End Date",
          "header": "%{client_name} - Licenses Usage",
          "license_has_expired": "License package has expired",
          "license_type": "License Type",
          "report_family": "Report Bundle",
          "start_date": "Start Date",
          "usage_percent": "% of Usage",
          "used_license_number": "Used Licenses",
          "used_license_overuse_number": "Over Use Allowance",
          "used_out_of": "%{used_number} out of %{number}"
        },
        "toggle_status": {
          "successfully": "Status of License was successfully updated."
        },
        "update": {
          "duplicate_licenses": "You have duplicate licenses",
          "successfully": "Licenses successfully updated"
        }
      },
      "list": {
        "admin": "Client Admin",
        "client_admins": "Client Admins",
        "report_bundle": "Report Bundle"
      },
      "new": {
        "header": "New Client"
      },
      "project_admins": {
        "create": {
          "successfully": "User %{name} was successfully created."
        },
        "destroy": {
          "successfully": "User %{name} was successfully deleted."
        },
        "edit": {
          "add": "Add",
          "grants": "Privileges",
          "hris_data": "HRIS Data",
          "key": "Key",
          "personal_data": "Personal Data",
          "remove": "Remove",
          "title": "Edit user",
          "value": "Value"
        },
        "form": {
          "choose": " - Choose - ",
          "choose_admin": "Choose Admin",
          "create_admin": "Create Admin"
        },
        "index": {
          "breadcrumb": "Project Admins",
          "title": "Project Admins"
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New user"
        },
        "reset_password": {
          "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
        },
        "resource": {
          "confirmations": {
            "change_password": {
              "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
              "title": "Change password <strong>%{name}</strong> ?"
            },
            "delete": {
              "body": "<p>Are you sure you want to delete this User?</p>\n",
              "title": "Delete <strong>%{name}</strong> ?"
            },
            "membership": {
              "delete": {
                "body": "<p>Are you sure you want to delete?</p>\n",
                "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
              }
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this User?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "change_password": "Change Password",
            "chart": "View user report",
            "delete": "Delete User",
            "edit": "Edit User",
            "mail": "Send Mail",
            "sign_in": "Login as user"
          }
        },
        "sidebar": {
          "api_keys": "API keys",
          "assessments_and_reports": "Assessments and Reporting",
          "destroy": "Delete User",
          "disable": "Disable",
          "edit_user": "Edit User",
          "email": "Send Mail",
          "enable": "Enable",
          "export_users": "Export users",
          "import_users": "Import users",
          "login_as_user": "Login as User",
          "new_user": "New User",
          "reset_password": "Change Password",
          "title": "User's options"
        },
        "spoof": {
          "successfully": "You was successfully login as %{name}"
        },
        "toggle_status": {
          "successfully": "User %{name} was successfully updated."
        },
        "update": {
          "successfully": "User %{name} was successfully updated."
        }
      },
      "projects": {
        "archive": {
          "successfully": "Project %{name} was successfully archived."
        },
        "assign_assessments": {
          "add_assessment": "Add Assessment",
          "assessments": "Assessments"
        },
        "assign_reports": {
          "add_report": "Add Report"
        },
        "campaigns": {
          "archive": {
            "successfully": "Campaign %{name} was successfully archived."
          },
          "copy": {
            "error": "Campaign %{name} was not copied.",
            "successfully": "Campaign %{name} was successfully copied."
          },
          "create": {
            "successfully": "Campaign %{name} was successfully created."
          },
          "destroy": {
            "successfully": "Campaign %{name} was successfully deleted."
          },
          "edit": {
            "header": "Edit Campaign"
          },
          "export": {
            "assigned_user": "Assigned Users",
            "completed_user": "Completed Users",
            "header": {
              "actions": "Actions",
              "actual_usage": "Actual Usage",
              "campaigns": "Campaigns",
              "name": "Name",
              "sub_campaign": "Sub-Campaigns",
              "tests_allocated": "Tests Allocated",
              "users": "Users"
            },
            "name": "Campaign Name"
          },
          "index": {
            "export": "Export",
            "new": "Add",
            "title": "Campaigns"
          },
          "list": {
            "assigned_user": "Assigned Users",
            "completed_user": "Completed Users",
            "header": {
              "actions": "Actions",
              "actual_usage": "Actual Usage",
              "campaigns": "Campaigns",
              "name": "Name",
              "sub_campaign": "Sub-Campaigns",
              "tests_allocated": "Tests Allocated",
              "users": "Users"
            },
            "name": "Campaign Name"
          },
          "new": {
            "header": "New Campaign"
          },
          "resource": {
            "sub_campaign": {
              "create": "Create New Sub-Campaign"
            },
            "tooltips": {
              "copy": "Copy Campaign",
              "create_report": "Add New Report",
              "create_user": "Add New User",
              "delete": "Delete Campaign",
              "edit": "Edit Campaign",
              "export": "Export"
            }
          },
          "sidebar": {
            "archive": "Archive Campaign",
            "copy": "Copy Campaign",
            "destroy": "Delete Campaign",
            "disable": "Disable",
            "edit": "Edit Campaign",
            "enable": "Enable",
            "new": "New Campaign",
            "title": "Campaign's options"
          },
          "sub_campaigns": {
            "archive": {
              "successfully": "Sub-Campaign %{name} was successfully archived."
            },
            "copy": {
              "error": "Sub-Campaign %{name} was not copied.",
              "successfully": "Sub-Campaign %{name} was successfully copied."
            },
            "create": {
              "successfully": "Sub-Campaign %{name} was successfully created."
            },
            "destroy": {
              "successfully": "Sub-Campaign %{name} was successfully deleted."
            },
            "edit": {
              "header": "Edit Sub-Campaign"
            },
            "export": {
              "assigned_user": "Assigned Users",
              "completed_user": "Completed Users",
              "header": {
                "actions": "Actions",
                "actual_usage": "Actual Usage",
                "archive_status": "Archive Status",
                "name": "Name",
                "sub_campaign": "Sub-Campaigns",
                "tests_allocated": "Tests Allocated",
                "users": "Users"
              },
              "name": "Sub-Campaign Name"
            },
            "header": {
              "actions": "Actions"
            },
            "index": {
              "export": "Export",
              "new": "Add",
              "title": "Sub Campaigns"
            },
            "list": {
              "assigned_user": "Assigned Users",
              "completed_user": "Completed Users",
              "header": {
                "actions": "Actions",
                "actual_usage": "Actual Usage",
                "archive_status": "Archive Status",
                "name": "Name",
                "sub_campaign": "Sub-Campaigns",
                "tests_allocated": "Tests Allocated",
                "users": "Users"
              },
              "name": "Sub-Campaign Name"
            },
            "new": {
              "header": "New Sub-Campaign"
            },
            "resource": {
              "tooltips": {
                "copy": "Copy Sub Campaign",
                "create_report": "Add new Report",
                "create_user": "Add New User",
                "delete": "Delete Sub Campaign",
                "edit": "Edit Sub Campaign"
              }
            },
            "sidebar": {
              "archive": "Archive Sub-Campaign",
              "copy": "Copy Sub-Campaign",
              "destroy": "Delete Sub-Campaign",
              "disable": "Disable",
              "edit": "Edit Sub-Campaign",
              "enable": "Enable",
              "new": "New Sub-Campaign",
              "title": "Sub-Campaign's options"
            },
            "toggle_status": {
              "successfully": "Sub-Campaign %{name} was successfully updated."
            },
            "update": {
              "successfully": "Sub-Campaign %{name} was successfully updated."
            }
          },
          "toggle_status": {
            "successfully": "Campaign %{name} was successfully updated."
          },
          "update": {
            "successfully": "Campaign %{name} was successfully updated."
          }
        },
        "copy": {
          "error": "Project %{name} was not copied.",
          "successfully": "Project %{name} was successfully copied."
        },
        "create": {
          "successfully": "Project %{name} was successfully created."
        },
        "destroy": {
          "successfully": "Project %{name} was successfully deleted."
        },
        "edit": {
          "header": "Edit Project"
        },
        "export": {
          "actual_usage": "Actual Usage",
          "admin": "Client Admin",
          "applicable_level": "Applicable Level",
          "archive_status": "Status",
          "assessments": "Assessments",
          "assigned_user": "Assigned Users",
          "completed_user": "Completed users",
          "created_at": "Created Date",
          "name": "Project name",
          "project_admin": "Project Admins",
          "reports": "Reports",
          "tests_allocated": "Tests Allocated",
          "tte_admin": "TTE Project Manager",
          "updated_at": "Modified Date",
          "url": "URL",
          "users_count": "Users Count"
        },
        "form": {
          "applicable_levels": {
            "campaign": "Campaign End Level",
            "project": "Project End Level",
            "sub_campaign": "Sub-Campaign End Level"
          },
          "data_privacy": "Data privacy",
          "project_number": "Project Number"
        },
        "header": {
          "actions": "Actions"
        },
        "index": {
          "export": "Export",
          "new": "Add",
          "title": "Projects",
          "tooltips": {
            "create": "Create",
            "export": "Export"
          }
        },
        "list": {
          "actual_usage": "Actual Usage",
          "admin": "Client Admin",
          "applicable_level": "Applicable Level",
          "archive_status": "Status",
          "assessments": "Assessments",
          "assigned_user": "Assigned Users",
          "completed_user": "Completed users",
          "created_at": "Created Date",
          "name": "Project name",
          "project_admin": "Project Admins",
          "reports": "Reports",
          "tests_allocated": "Tests Allocated",
          "tte_admin": "TTE Project Manager",
          "updated_at": "Modified Date",
          "url": "URL",
          "users_count": "Users Count"
        },
        "new": {
          "header": "New Project"
        },
        "resource": {
          "add_assessment": "Add Assessment",
          "add_report": "Add Report",
          "assessments": "Assessments",
          "tooltips": {
            "copy": "Copy Project",
            "create_admin": "Create Project Admin",
            "create_report": "Add New Report",
            "create_user": "Add New User",
            "delete": "Delete Project",
            "edit": "Edit Project"
          }
        },
        "sidebar": {
          "admins": "Admin Users",
          "archive": "Archive Project",
          "copy": "Copy Project",
          "design": "Edit Design",
          "destroy": "Delete Project",
          "disable": "Disable",
          "edit": "Edit Project",
          "enable": "Enable",
          "new": "New Project",
          "title": "Project's options",
          "view_licenses": "View Licenses"
        },
        "threesixty_campaigns": {
          "base": {
            "active": "Active",
            "archived": "Archived",
            "disable": "Archive",
            "enable": "Unarchive"
          },
          "completion_statuses": {
            "approved": "Approved",
            "completed": "Completed",
            "denied": "Denied",
            "in_progress": "In Progress",
            "not_started": "Not Started"
          },
          "copy": {
            "error": "Client Tenancy %{name} was not copied.",
            "successfully": "Client Tenancy %{name} was successfully copied."
          },
          "create": {
            "successfully": "Client Tenancy %{name} was successfully created."
          },
          "designs": {
            "form": {
              "no_background": "No Background yet",
              "no_logo": "No Logo yet"
            }
          },
          "destroy": {
            "successfully": "Client Tenancy %{name} was successfully deleted."
          },
          "edit": {
            "header": "Edit 360 Campaign"
          },
          "export": {
            "admin": "Client Admin",
            "client_admins": "Client Admins",
            "report_bundle": "Report Bundle"
          },
          "index": {
            "export": "Export",
            "new": "Add 360 Campaign",
            "title": "360 Campaigns"
          },
          "license": {
            "header": "%{name} - Edit license"
          },
          "licenses": {
            "update": {
              "duplicate_licenses": "You have duplicate licenses",
              "successfully": "Licenses successfully updated"
            }
          },
          "list": {
            "admin": "Client Admin",
            "client_admins": "Client Admins",
            "report_bundle": "Report Bundle"
          },
          "new": {
            "header": "New 360 Campaign"
          },
          "resource": {
            "confirmations": {
              "delete": {
                "body": {
                  "0": "<p>Are you sure you want to delete?</p> <p>All Campaigns, Sub-campaigns and users will also be deleted</p>",
                  "1": "<p>Are you sure you want to delete?</p> <p>All Sub-campaigns and users will also be deleted</p>",
                  "2": "<p>Are you sure you want to delete?</p> <p>All users will also be deleted</p>"
                },
                "title": "Delete <strong>%{name}</strong> ?"
              },
              "disable": {
                "body": {
                  "0": "<p>Are you sure you want to archive?</p> <p>All Campaigns, Sub-campaigns and users will also be archived</p>",
                  "1": "<p>Are you sure you want to archive?</p> <p>All Sub-campaigns and users will also be archived</p>",
                  "2": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>",
                  "3": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>"
                },
                "title": "Archive <strong>%{name}</strong> ?"
              },
              "enable": {
                "body": {
                  "0": "<p>Are you sure you want to unarchive?</p>",
                  "1": "<p>Are you sure you want to unarchive?</p>",
                  "2": "<p>Are you sure you want to unarchive?</p>",
                  "3": "<p>Are you sure you want to unarchive?</p>"
                },
                "title": "Unarchive <strong>%{name}</strong> ?"
              }
            },
            "tooltips": {
              "copy": "Copy Client",
              "create_admin": "Create Client Admin",
              "delete": "Delete Client",
              "disable": "Disable Client",
              "edit": "Edit Client",
              "enable": "Enable Client"
            }
          },
          "statistics": {
            "index": {
              "all_assessments": "All assessments",
              "assessment_type": "Assessment type",
              "title": "Statistics"
            }
          },
          "toggle_status": {
            "successfully": "Client Tenancy %{name} was successfully updated."
          },
          "update": {
            "successfully": "Client Tenancy %{name} was successfully updated."
          },
          "url": "Url"
        },
        "toggle_status": {
          "successfully": "Project %{name} was successfully updated."
        },
        "update": {
          "successfully": "Project %{name} was successfully updated."
        }
      },
      "reports": {
        "copy": {
          "error": "Report #%{id} was not copied."
        },
        "create": {
          "successfully": "Report %{name} was successfully created for Client."
        },
        "destroy": {
          "successfully": "Report %{name} was successfully deleted from Client."
        },
        "edit": {
          "header": "Edit Report Name"
        },
        "form": {
          "load_mindmill_report": "Load from Mindmill",
          "none_external": "None - Use report builder",
          "select_family": "Select Report Bundle",
          "types": {
            "common": "Any",
            "eti": "ETI",
            "yti": "YTI"
          }
        },
        "index": {
          "add": "Add",
          "bulk_download": "Bulk Download",
          "families": "Report Bundles",
          "filterrific": {
            "with_assessment_category": {
              "360": "360 Feedback",
              "all": "All",
              "case_study": "Case Studies",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "owner": "Owner",
          "regenerate": "Regenerate Reports",
          "report_family": "Report Bundle",
          "title": "Reports",
          "tooltips": {
            "create": "Create"
          }
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "Select Report"
        },
        "preview": {
          "export_pdf": "Export to PDF",
          "title": "Preview"
        },
        "regenerate": {
          "successfully": "Report successfully sent for regeneration"
        },
        "regenerates": {
          "create": {
            "successfully": "Report(s) successfully sent for regeneration"
          }
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Report?</p>\n",
              "title": "Delete <strong>Report</strong> ?"
            },
            "detach": {
              "body": "<p>Are you sure you want to detach this Report?</p>\n",
              "title": "Detach <strong>Report</strong> ?"
            },
            "regenerate": {
              "body": "<p>Are you sure you want to regenerate this Report for all Users?</p>",
              "title": "Regenerate <strong>%{name}</strong>?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "copy": "Copy Report",
            "delete": "Delete Report",
            "edit": "Edit Report",
            "preview": "Preview Report"
          }
        },
        "sidebar": {
          "copy": "Copy Report",
          "destroy": "Delete Report",
          "edit": "Edit Report",
          "regenerate": "Regenerate Report",
          "title": "Report's options",
          "view": "View Report"
        },
        "toggle_status": {
          "successfully": "Report was successfully updated."
        },
        "types": {
          "common": "Any",
          "eti": "ETI",
          "yti": "YTI"
        },
        "update": {
          "successfully": "Report %{name} was successfully updated."
        }
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": {
              "0": "<p>Are you sure you want to delete?</p> <p>All Campaigns, Sub-campaigns and users will also be deleted</p>",
              "1": "<p>Are you sure you want to delete?</p> <p>All Sub-campaigns and users will also be deleted</p>",
              "2": "<p>Are you sure you want to delete?</p> <p>All users will also be deleted</p>"
            },
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "disable": {
            "body": {
              "0": "<p>Are you sure you want to archive?</p> <p>All Campaigns, Sub-campaigns and users will also be archived</p>",
              "1": "<p>Are you sure you want to archive?</p> <p>All Sub-campaigns and users will also be archived</p>",
              "2": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>",
              "3": "<p>Are you sure you want to archive?</p> <p>All users will also be archived</p>"
            },
            "title": "Archive <strong>%{name}</strong> ?"
          },
          "enable": {
            "body": {
              "0": "<p>Are you sure you want to unarchive?</p>",
              "1": "<p>Are you sure you want to unarchive?</p>",
              "2": "<p>Are you sure you want to unarchive?</p>",
              "3": "<p>Are you sure you want to unarchive?</p>"
            },
            "title": "Unarchive <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Client",
          "create_admin": "Create Client Admin",
          "delete": "Delete Client",
          "disable": "Disable Client",
          "edit": "Edit Client",
          "enable": "Enable Client"
        }
      },
      "sidebar": {
        "copy": "Copy Client",
        "design": "Edit Design",
        "destroy": "Delete Client",
        "disable": "Disable",
        "edit": "Edit Client",
        "enable": "Enable",
        "licenses": "Manage Licenses",
        "new": "New Client",
        "title": "Client's options"
      },
      "statistics": {
        "index": {
          "all_assessments": "All assessments",
          "assessment_type": "Assessment type",
          "title": "Statistics"
        }
      },
      "sub_campaigns": {
        "archive": {
          "successfully": "Sub-Campaign %{name} was successfully archived."
        },
        "copy": {
          "error": "Sub-Campaign %{name} was not copied.",
          "successfully": "Sub-Campaign %{name} was successfully copied."
        },
        "create": {
          "successfully": "Sub-Campaign %{name} was successfully created."
        },
        "destroy": {
          "successfully": "Sub-Campaign %{name} was successfully deleted."
        },
        "edit": {
          "header": "Edit Sub-Campaign"
        },
        "export": {
          "assigned_user": "Assigned Users",
          "completed_user": "Completed Users",
          "header": {
            "actions": "Actions",
            "actual_usage": "Actual Usage",
            "archive_status": "Archive Status",
            "name": "Name",
            "sub_campaign": "Sub-Campaigns",
            "tests_allocated": "Tests Allocated",
            "users": "Users"
          },
          "name": "Sub-Campaign Name"
        },
        "header": {
          "actions": "Actions"
        },
        "index": {
          "export": "Export",
          "new": "Add",
          "title": "Sub Campaigns"
        },
        "list": {
          "assigned_user": "Assigned Users",
          "completed_user": "Completed Users",
          "header": {
            "actions": "Actions",
            "actual_usage": "Actual Usage",
            "archive_status": "Archive Status",
            "name": "Name",
            "sub_campaign": "Sub-Campaigns",
            "tests_allocated": "Tests Allocated",
            "users": "Users"
          },
          "name": "Sub-Campaign Name"
        },
        "new": {
          "header": "New Sub-Campaign"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Sub Campaign",
            "create_report": "Add new Report",
            "create_user": "Add New User",
            "delete": "Delete Sub Campaign",
            "edit": "Edit Sub Campaign"
          }
        },
        "sidebar": {
          "archive": "Archive Sub-Campaign",
          "copy": "Copy Sub-Campaign",
          "destroy": "Delete Sub-Campaign",
          "disable": "Disable",
          "edit": "Edit Sub-Campaign",
          "enable": "Enable",
          "new": "New Sub-Campaign",
          "title": "Sub-Campaign's options"
        },
        "toggle_status": {
          "successfully": "Sub-Campaign %{name} was successfully updated."
        },
        "update": {
          "successfully": "Sub-Campaign %{name} was successfully updated."
        }
      },
      "toggle_status": {
        "successfully": "Client Tenancy %{name} was successfully updated."
      },
      "tooltips": {
        "copy": "Copy Campaign",
        "create_report": "Add New Report",
        "create_user": "Add New User",
        "delete": "Delete Campaign",
        "edit": "Edit Campaign",
        "export": "Export"
      },
      "update": {
        "successfully": "Client Tenancy %{name} was successfully updated."
      },
      "url": "Url",
      "users": {
        "admins": {
          "breadcrumb": "Admin Users",
          "title": "Admins"
        },
        "assigns": {
          "common": {
            "detach_assessment": "Assessment %{name} was successfully detached.",
            "detach_report": "Report %{name} was successfully detached."
          },
          "create": {
            "successfully": "Successfully Updated"
          },
          "form": {
            "assessment": "Assessment",
            "multiple_report_message": "The report has data from multiple assessments. To provide an access to the user to download the results you should assign all assessments linked to the report.",
            "user_access": {
              "access": "Reports access",
              "preserve_user_access": "Apply access settings only for the newly added report",
              "user": "User"
            }
          },
          "index": {
            "add_assessments": "Add Assessments",
            "add_reports": "Add Reports",
            "title": "%{name} - Assessments and Reporting"
          },
          "list": {
            "actions": "Actions",
            "assessment_name": "Assessment Name",
            "assessment_type": "Assessment Type",
            "completed_at": "Completed at",
            "reports": "Reports",
            "status": "Status",
            "uniq_id": "Uniq ID"
          },
          "new": {
            "header": "Assign Assessment and Reports"
          },
          "reset": {
            "successfully": "Result data was successfully reseted"
          },
          "resource": {
            "confirms": {
              "assigns_report": {
                "add_user_access": {
                  "body": "<p>Are you sure you want to add user access to this report?</p>",
                  "title": "Add user access to <strong>%{name}</strong> ?"
                },
                "delete": {
                  "body": "<p>Are you sure you want to detach this report?</p>",
                  "title": "Detach <strong>%{name}</strong> ?"
                },
                "regenerate": {
                  "body": "<p>Are you sure you want to regenerate this report?</p>",
                  "title": "Regenerate <strong>%{name}</strong> ?"
                },
                "remove_user_access": {
                  "body": "<p>Are you sure you want to remove user access to this report?</p>",
                  "title": "Remove user access to <strong>%{name}</strong> ?"
                }
              },
              "reset": {
                "body": "<p>Are you sure you want to reset result?</p>",
                "title": "Reset <strong>Result</strong> ?"
              }
            },
            "generating": "Report \"%{name}\" is generating",
            "no_access_to_reports": "No access to reports",
            "no_reports": "No relative reports",
            "not_completed": "Not completed",
            "tooltips": {
              "assigns_report": {
                "add_user_access": "Add user access",
                "delete": "Detach Report",
                "regenerate": "Regenerate report file",
                "remove_user_access": "Remove user access"
              },
              "delete": "Detach Assessment",
              "reset": "Reset result"
            }
          }
        },
        "assigns_reports": {
          "edit": {
            "header": "Add Reports"
          },
          "form": {
            "assessment": "Assessment",
            "detach": "Detach",
            "multiple_report_message": "The report has data from multiple assessments. To provide an access to the user to download the results you should assign all assessments linked to the report.",
            "user_access": {
              "access": "Reports access",
              "user": "User"
            }
          },
          "new": {
            "header": "Add Reports"
          },
          "regenerate": {
            "successfully": "Successfully sent to regenerate"
          },
          "update": {
            "successfully": "Successfully Updated"
          }
        },
        "create": {
          "successfully": "User %{name} was successfully created."
        },
        "destroy": {
          "successfully": "User %{name} was successfully deleted."
        },
        "edit": {
          "add": "Add",
          "grants": "Privileges",
          "hris_data": "HRIS Data",
          "key": "Key",
          "personal_data": "Personal Data",
          "remove": "Remove",
          "title": "Edit user",
          "value": "Value"
        },
        "form": {
          "choose": " - Choose - "
        },
        "form_admin": {
          "choose_admin": "Choose Admin",
          "create_admin": "Create Admin"
        },
        "index": {
          "breadcrumb": "Users",
          "export": "Export",
          "export_completion_status": "Completion Status",
          "export_users": "Users",
          "filterrific": {
            "with_role": {
              "administration": "Administrators",
              "all": "All",
              "users": "Users"
            }
          },
          "import": "Import",
          "import_hris": "HRIS Data",
          "import_users": "Users",
          "new": "Add",
          "new_superadmin": "Add SuperAdmin",
          "title": "Users",
          "tooltips": {
            "create": "Create",
            "export": "Export",
            "import": "Import"
          }
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New user"
        },
        "reports": {
          "copy": {
            "error": "Report #%{id} was not copied."
          },
          "create": {
            "successfully": "Report %{name} was successfully created."
          },
          "destroy": {
            "successfully": "Report %{name} was successfully deleted."
          },
          "edit": {
            "header": "Edit Report Name"
          },
          "form": {
            "load_mindmill_report": "Load from Mindmill",
            "none_external": "None - Use report builder",
            "select_family": "Select Report Bundle",
            "types": {
              "common": "Any",
              "eti": "ETI",
              "yti": "YTI"
            }
          },
          "index": {
            "add": "Add",
            "bulk_download": "Bulk Download",
            "families": "Report Bundles",
            "filterrific": {
              "with_assessment_category": {
                "360": "360 Feedback",
                "all": "All",
                "case_study": "Case Studies",
                "organisational": "Org Surveys",
                "psychometric": "Psychometrics"
              }
            },
            "owner": "Owner",
            "regenerate": "Regenerate Reports",
            "report_family": "Report Bundle",
            "title": "Reports",
            "tooltips": {
              "create": "Create"
            }
          },
          "list": {
            "created_at": "Created Date",
            "updated_at": "Modified Date"
          },
          "new": {
            "header": "Select Report"
          },
          "preview": {
            "export_pdf": "Export to PDF",
            "title": "Preview"
          },
          "regenerate": {
            "successfully": "Report successfully sent for regeneration"
          },
          "resource": {
            "confirmations": {
              "delete": {
                "body": "<p>Are you sure you want to delete this Report?</p>\n",
                "title": "Delete <strong>Report</strong> ?"
              },
              "detach": {
                "body": "<p>Are you sure you want to detach this Report?</p>\n",
                "title": "Detach <strong>Report</strong> ?"
              },
              "regenerate": {
                "body": "<p>Are you sure you want to regenerate this Report for all Users?</p>",
                "title": "Regenerate <strong>%{name}</strong>?"
              },
              "toggle_status": {
                "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
                "title": "<strong>%{status}</strong> %{name}?"
              }
            },
            "tooltips": {
              "copy": "Copy Report",
              "delete": "Delete Report",
              "edit": "Edit Report",
              "preview": "Preview Report"
            }
          },
          "sidebar": {
            "copy": "Copy Report",
            "destroy": "Delete Report",
            "edit": "Edit Report",
            "regenerate": "Regenerate Report",
            "title": "Report's options",
            "view": "View Report"
          },
          "toggle_status": {
            "successfully": "Report was successfully updated."
          },
          "types": {
            "common": "Any",
            "eti": "ETI",
            "yti": "YTI"
          },
          "update": {
            "successfully": "Report %{name} was successfully updated."
          }
        },
        "reset_password": {
          "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
        },
        "resource": {
          "confirmations": {
            "change_password": {
              "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
              "title": "Change password <strong>%{name}</strong> ?"
            },
            "delete": {
              "body": "<p>Are you sure you want to delete this User?</p>\n",
              "title": "Delete <strong>%{name}</strong> ?"
            },
            "membership": {
              "delete": {
                "body": "<p>Are you sure you want to delete?</p>\n",
                "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
              }
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this User?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "change_password": "Change Password",
            "chart": "View user report",
            "delete": "Delete User",
            "edit": "Edit User",
            "mail": "Send Mail",
            "sign_in": "Login as user"
          }
        },
        "sidebar": {
          "api_keys": "API keys",
          "assessments_and_reports": "Assessments and Reporting",
          "destroy": "Delete User",
          "disable": "Disable",
          "edit_user": "Edit User",
          "email": "Send Mail",
          "enable": "Enable",
          "export_users": "Export users",
          "import_users": "Import users",
          "login_as_user": "Login as User",
          "new_user": "New User",
          "reset_password": "Change Password",
          "title": "User's options"
        },
        "spoof": {
          "successfully": "You was successfully login as %{name}"
        },
        "toggle_status": {
          "successfully": "User %{name} was successfully updated."
        },
        "update": {
          "successfully": "User %{name} was successfully updated."
        }
      }
    },
    "clients_hierarchy": "Project > Campaign > Sub Campaign",
    "close": "Close",
    "communications": {
      "copy": {
        "error": "Communication #%{id} was not copied."
      },
      "create": {
        "successfully": "Communication created successfully."
      },
      "destroy": {
        "successfully": "Communication %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Communication"
      },
      "form": {
        "body_mustache": "{{{user_link}}} - Link to the Platform for existing users or a one time only link to set a password for new users\n{{first_name}} - Recipient First Name\n{{last_name}} - Recipient Last Name\n{{email}} - Recipient Email\n",
        "delivery_at": "Delivery at (GST)",
        "delivery_rules": {
          "in_progress": "If assessment is in progress",
          "not_competed": "If assessment is not completed",
          "not_started": "If assessment is not started",
          "send_now": "Send now",
          "specific_datetime": "Send at"
        },
        "kind": "Communication Types",
        "selected_cc_recipients": "Selected CC Recipients",
        "selected_recipients": "Selected Recipients",
        "stop_reminder": "Stop sending reminders",
        "stop_reminder_datetime": "End date for reminders (GST)"
      },
      "index": {
        "clients": "Clients",
        "completion": "Completion",
        "invitation": "Invitation",
        "new": "Add",
        "other": "Other",
        "owner": "Owner",
        "reminder": "Reminder",
        "title": "Communication Center",
        "tooltips": {
          "create": "Create"
        },
        "type": "Type"
      },
      "list": {
        "actions": "Actions",
        "author": "Created by",
        "campaign": "Campaign",
        "client_name": "Client",
        "created_at": "Created Date",
        "creator_first_name": "Created by",
        "delivery_rule": "Delivery",
        "kind": "Communication type",
        "project": "Project",
        "recipients": "Recipients",
        "sub_campaign": "Sub-campaign",
        "subject": "Communication subject",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New Communication"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Communication?</p>\n",
            "title": "Delete <strong>Communication</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Communication?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Communication",
          "delete": "Delete Communication",
          "download": "Download Communication History",
          "edit": "Edit Communication",
          "view": "View Communication"
        }
      },
      "show": {
        "assessment": "Assessment:",
        "back": "Back",
        "body": "Body:",
        "campaign": "Campaign:",
        "client": "Client:",
        "communication_type": "Communication type:",
        "delivery_interval": "Delivery interval:",
        "delivery_rule": "Delivery rule:",
        "every_interval": "Every %{interval}",
        "owner": "Owner:",
        "project": "Project:",
        "recipients": "Recipients:",
        "specific_datetime": "Send at:",
        "stop_reminder_datetime": "End date for reminders (GST)",
        "sub_campaign": "Sub Campaign:",
        "subject": "Subject:",
        "users": "Users:"
      },
      "sidebar": {
        "copy": "Copy Communication",
        "destroy": "Delete Communication",
        "download": "Download Communication History",
        "edit": "Edit Communication",
        "new": "New Communication",
        "title": "Communication's options",
        "view": "View Communication"
      },
      "toggle_status": {
        "successfully": "Communication was successfully updated."
      }
    },
    "copy": "Copy",
    "create": "Create",
    "created": "Successfully created",
    "created_by": "Created By",
    "dimensions": {
      "copy": {
        "error": "Dimension #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Dimension %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Dimension Name"
      },
      "index": {
        "new": "Add",
        "owner": "Owner",
        "title": "Dimensions",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New Dimension"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Dimension?</p>\n",
            "title": "Delete <strong>Dimension</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Dimension?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Dimension",
          "delete": "Delete Dimension",
          "edit": "Edit Dimension Name"
        }
      },
      "sidebar": {
        "assign": "Assign Dimension",
        "copy": "Copy Dimension",
        "destroy": "Delete Dimension",
        "disable": "Disable Dimension",
        "edit": "Edit Dimension Name",
        "enable": "Enable Dimension",
        "new": "New Dimension",
        "title": "Dimension's options",
        "view": "View Dimension"
      },
      "toggle_status": {
        "successfully": "Dimension was successfully updated."
      }
    },
    "disable": "Disable",
    "edit": "Edit",
    "enable": "Enable",
    "factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Factor Name"
      },
      "form": {
        "no_icon": "No Logo yet"
      },
      "index": {
        "icon": "Icon",
        "new": "Add",
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Factor?</p>\n",
            "title": "Delete <strong>Factor</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Factor?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Factor",
          "delete": "Delete Factor",
          "edit": "Edit Factor"
        }
      },
      "sidebar": {
        "copy": "Copy Factor",
        "destroy": "Delete Factor",
        "edit": "Edit Factor",
        "title": "Factor's options",
        "view": "View Factor"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "genders": {
      "female": "Female",
      "male": "Male",
      "not_set": "Not set"
    },
    "hide": "Hide",
    "home": {
      "index": {
        "notifications": "Notifications"
      }
    },
    "import": "Import",
    "imports": {
      "assessments": {
        "results": {
          "existing_users_whose_password_not_changed_modal_dialog": {
            "header": "The list of users whose passwords will be not changed"
          },
          "form": {
            "description": "Refer to the Export functionality to extract a template that can be used to Import here.",
            "import": "Import"
          }
        }
      },
      "base": {
        "form": {
          "import": "Import"
        }
      },
      "errors": {
        "error": "[Row %{row}] %{error}",
        "invalid_assign": "Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
        "invalid_format": "There is no Email column",
        "norm": {
          "factor_is_not_described": "[#%{coords}] factor %{factor} is not described above",
          "factors_mismatch": "[#%{coords}] dimension %{dimension} does not have factor %{factor}",
          "not_set_dimension": "The name of the Dimension should be written in A-1",
          "sub_factors_mismatch": "[#%{coords}] dimension %{dimension} does not have sub factor %{factor}"
        },
        "result": {
          "error": "[Row %{row}] %{error}",
          "invalid_assign": "[Row %{row}] Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
          "invalid_format": "Invalid File format"
        },
        "translation": {
          "error": "[Translation %{id}] %{error}",
          "invalid_format": "Invalid File format"
        },
        "unknown_type": "Unknown file type: %{filename}",
        "user": {
          "not_found": "[Row %{row}] Couldn't find User with Email Address %{email}"
        }
      },
      "form": {
        "description": "Refer to the Export functionality to extract a template that can be used to Import here.",
        "import": "Import"
      },
      "hris": {
        "existing_users_whose_password_not_changed_modal_dialog": {
          "header": "The list of users whose passwords will be not changed"
        },
        "form": {
          "description": "Refer to the Export functionality to extract a template that can be used to Import here.",
          "import": "Import"
        }
      },
      "new": {
        "header": "Import"
      },
      "users": {
        "existing_users_whose_password_not_changed_modal_dialog": {
          "header": "The list of users whose passwords will be not changed"
        },
        "form": {
          "description": "Refer to the Export functionality to extract a template that can be used to Import here.",
          "import": "Import"
        }
      }
    },
    "imports_assessments_result_imports": {
      "create": {
        "successfully": "Raw Results data was successfully imported"
      },
      "modal": {
        "header": {
          "raw": "Import Raw Results data",
          "scoring": "Import Scoring Results data"
        }
      }
    },
    "imports_hris_imports": {
      "create": {
        "successfully": "HRIS data was successfully imported"
      },
      "new": {
        "header": "Import HRIS data"
      }
    },
    "imports_user_imports": {
      "create": {
        "successfully": "Users was successfully imported"
      },
      "new": {
        "header": "Import Users"
      }
    },
    "libraries": {
      "create": {
        "successfully": "Item %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Item %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit"
      },
      "index": {
        "new_folder": "New Folder",
        "owner": "Owner",
        "title": "Media Library",
        "upload": "Upload"
      },
      "list": {
        "created_at": "Created Date",
        "new_folder": "New folder",
        "root": "Media Library",
        "updated_at": "Modified Date",
        "upload": "Upload new file"
      },
      "new": {
        "header": "New Report"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete %{name}?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete",
          "edit": "Edit"
        }
      },
      "update": {
        "successfully": "Item %{name} was successfully updated."
      }
    },
    "memberships": {
      "admin": {
        "new": {
          "header": "New admin"
        }
      },
      "admin_chosen": {
        "successfully": "Admin users was successfully updated."
      },
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully deleted."
      },
      "edit": {
        "add": "Add",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "index": {
        "export": "Export",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "new": "Add",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    },
    "meta_title": "Administration panel",
    "modified_by": "Modified By",
    "navigation": {
      "admins": "Admins",
      "assessments": "Assessments",
      "campaign_templates": "Campaign Templates",
      "campaigns": "Campaigns",
      "client": "Client Tenancy",
      "client_admins": "Client Admins",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "datasheets": "Datasheets",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "licenses": "Licenses",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "products": "Products",
      "project_admins": "Project Admins",
      "projects": "Projects",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "report_families": "Report Bundles",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_campaigns": "Sub Campaigns",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "new": "New",
    "no_data_found": "No data found",
    "norms": {
      "copy": {
        "error": "Norm #%{id} was not copied."
      },
      "create": {
        "successfully": "Norm %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Norm %{name} was successfully deleted."
      },
      "edit": {
        "header": "Rename Norm"
      },
      "editor": {
        "factors": "Factors",
        "inplace_title": "Enter value",
        "sub_factors": "Sub Factors",
        "title": "Norm Editor",
        "tooltips": {
          "edit": "Edit Title"
        }
      },
      "index": {
        "export": "Export",
        "import": "Import",
        "new": "Add",
        "owner": "Owner",
        "title": "Norms"
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New norm"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Norm?</p>\n",
            "title": "Delete <strong>Norm</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Norm?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Norm",
          "delete": "Delete Norm",
          "edit": "Rename Norm"
        }
      },
      "sidebar": {
        "assign": "Assign Norm",
        "copy": "Copy Norm",
        "destroy": "Delete Norm",
        "disable": "Disable",
        "edit": "Rename Norm",
        "editor": "Norm Editor",
        "enable": "Enable",
        "export": "Export Norm",
        "import": "Import Norm",
        "new": "New Norm",
        "surveys": "Linked Surveys",
        "title": "Norm's options",
        "view": "View Norm"
      },
      "toggle_status": {
        "successfully": "Norm was successfully updated."
      },
      "update": {
        "successfully": "Norm %{name} was successfully updated."
      }
    },
    "noty": {
      "error_408": "This action takes too long. Please try to reload the page.",
      "error_500": "Something went wrong. Contact your administrator."
    },
    "occupations": {
      "copy": {
        "error": "Occupation #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Occupation #%{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit occupation"
      },
      "form": {
        "hint": {
          "key_career_tracks": "\"+\" - list, \"*\" - bold. Example: + *Biology* - some description..."
        }
      },
      "index": {
        "new": "Add",
        "title": "Occupations",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New occupation"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this occupation?</p>\n",
            "title": "Delete <strong>Occupation</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Occupation",
          "delete": "Delete Occupation",
          "edit": "Edit Occupation"
        }
      },
      "sidebar": {
        "copy": "Copy Occupation",
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "New Occupation",
        "title": "Occupation's options"
      },
      "toggle_status": {
        "successfully": "Occupation was successfully updated."
      }
    },
    "occupations_factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor #%{name} was successfully detached."
      },
      "edit": {
        "header": "Edit Factor"
      },
      "index": {
        "new": "Add",
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "Attach Factors"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this factor?</p>",
            "title": "Delete <strong>Factor</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete Factor",
          "edit": "Edit Factor"
        }
      },
      "sidebar": {
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "Attach Factor",
        "title": "Factor's options"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "products": {
      "copy": {
        "error": "Product",
        "successfully": "Product %{name} was successfully copied."
      },
      "create": {
        "successfully": "Product %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Product %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Product"
      },
      "form": {
        "add_image": "Add Image",
        "images": "Images",
        "prices": "Prices",
        "reports": "Reports"
      },
      "image_fields": {
        "remove": "Remove Image"
      },
      "index": {
        "new": "Add",
        "title": "Products list"
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New Product"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Product?</p>\n",
            "title": "Delete <strong>Product</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Product?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Product",
          "delete": "Delete Product",
          "edit": "Edit Product"
        }
      },
      "sidebar": {
        "copy": "Copy Product",
        "destroy": "Destroy Product",
        "disable": "Disable",
        "edit": "Edit Product",
        "enable": "Enable",
        "new": "New Product",
        "title": "Product's options"
      },
      "update": {
        "successfully": "Product %{name} was successfully updated."
      }
    },
    "profiles": {
      "edit": {
        "success": "Profile was successfully updated.",
        "title": "Profile Editor"
      }
    },
    "psychometrics": "Psychometrics",
    "questions": {
      "destroy": {
        "successfully": "Question %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Question"
      },
      "index": {
        "owner": "Owner"
      },
      "new": {
        "header": "New Question"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Question?</p>\n",
            "title": "Delete <strong>Question</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Question?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "report_families": {
      "copy": {
        "error": "Report Bundle #%{id} was not copied."
      },
      "create": {
        "successfully": "Report Bundle %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Report Bundle %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Report Bundle Name"
      },
      "index": {
        "add": "Add",
        "families": "Families",
        "title": "Report Bundles",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New Report Bundle"
      },
      "reports": {
        "index": {
          "add": "Add new Report",
          "title": "Reports in the Bundle",
          "tooltips": {
            "create": "Create"
          }
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Report from Bundle?</p>\n",
              "title": "Delete <strong>Report</strong> from Bundle?"
            }
          },
          "tooltips": {
            "delete": "Delete Report from Bundle"
          }
        }
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Report Bundle?</p>\n",
            "title": "Delete <strong>Report</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Report Bundle?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Report Bundle",
          "delete": "Delete Report Bundle",
          "edit": "Edit Report Bundle",
          "preview": "Preview Report Bundle"
        }
      },
      "sidebar": {
        "copy": "Copy Report Bundle",
        "destroy": "Delete Report Bundle",
        "edit": "Edit Report Bundle",
        "title": "Report Bundle's options",
        "view": "View Report Bundle"
      },
      "update": {
        "successfully": "Report Bundle %{name} was successfully updated."
      }
    },
    "reports": {
      "copy": {
        "error": "Report #%{id} was not copied."
      },
      "create": {
        "successfully": "Report %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Report %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Report Name"
      },
      "form": {
        "load_mindmill_report": "Load from Mindmill",
        "none_external": "None - Use report builder",
        "select_family": "Select Report Bundle",
        "types": {
          "common": "Any",
          "eti": "ETI",
          "yti": "YTI"
        }
      },
      "index": {
        "add": "Add",
        "bulk_download": "Bulk Download",
        "families": "Report Bundles",
        "filterrific": {
          "with_assessment_category": {
            "360": "360 Feedback",
            "all": "All",
            "case_study": "Case Studies",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "owner": "Owner",
        "regenerate": "Regenerate Reports",
        "report_family": "Report Bundle",
        "title": "Reports",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "Select Report"
      },
      "preview": {
        "export_pdf": "Export to PDF",
        "title": "Preview"
      },
      "regenerate": {
        "successfully": "Report successfully sent for regeneration"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Report?</p>\n",
            "title": "Delete <strong>Report</strong> ?"
          },
          "detach": {
            "body": "<p>Are you sure you want to detach this Report?</p>\n",
            "title": "Detach <strong>Report</strong> ?"
          },
          "regenerate": {
            "body": "<p>Are you sure you want to regenerate this Report for all Users?</p>",
            "title": "Regenerate <strong>%{name}</strong>?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Report",
          "delete": "Delete Report",
          "edit": "Edit Report",
          "preview": "Preview Report"
        }
      },
      "sidebar": {
        "copy": "Copy Report",
        "destroy": "Delete Report",
        "edit": "Edit Report",
        "regenerate": "Regenerate Report",
        "title": "Report's options",
        "view": "View Report"
      },
      "toggle_status": {
        "successfully": "Report was successfully updated."
      },
      "types": {
        "common": "Any",
        "eti": "ETI",
        "yti": "YTI"
      },
      "update": {
        "successfully": "Report %{name} was successfully updated."
      }
    },
    "save": "Save",
    "search": "Search",
    "show": "Show",
    "sub_factors": {
      "copy": {
        "error": "Sub-Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Sub-Factor %{name} was successfully deleted."
      },
      "edit": {
        "header": "Edit Sub-Factor Name"
      },
      "index": {
        "new": "Add",
        "title": "Sub-Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Sub-Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Sub-Factor?</p>\n",
            "title": "Delete <strong>Sub-Factor</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Sub-Factor",
          "delete": "Delete Sub-Factor",
          "edit": "Edit Sub-Factor Name"
        }
      },
      "sidebar": {
        "destroy": "Delete Sub-Factor",
        "edit": "Edit Sub-Factor",
        "title": "Sub-Factor's options"
      },
      "toggle_status": {
        "successfully": "Sub-Factor was successfully updated."
      }
    },
    "templates": {
      "blocks": {
        "copy": {
          "error": "Block"
        },
        "destroy": {
          "successfully": "Block %{name} was successfully deleted."
        },
        "edit": {
          "header": "Edit Block"
        },
        "index": {
          "new": "Add",
          "templates": {
          },
          "title": "Blocks",
          "tooltips": {
            "create": "Create"
          }
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New Block"
        },
        "new_assign": {
          "header": "Assign Block to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Block",
            "delete": "Delete Block",
            "edit": "Edit Block"
          }
        },
        "sidebar": {
          "destroy": "Delete Block",
          "disable": "Disable",
          "edit": "Edit Block",
          "enable": "Enable",
          "new": "New Block",
          "new_assign": "Assign Block",
          "title": "Block's options"
        }
      },
      "questions": {
        "copy": {
          "error": "Question"
        },
        "destroy": {
          "successfully": "Question %{name} was successfully deleted."
        },
        "edit": {
          "header": "Edit Question"
        },
        "index": {
          "new": "Add",
          "templates": {
            "blocks": "Blocks",
            "questions": "Questions"
          },
          "title": "Questions",
          "tooltips": {
            "create": "Create"
          }
        },
        "list": {
          "created_at": "Created Date",
          "updated_at": "Modified Date"
        },
        "new": {
          "header": "New Question"
        },
        "new_assign": {
          "header": "Assign Question to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Question",
            "delete": "Delete Question",
            "edit": "Edit Question"
          }
        },
        "sidebar": {
          "destroy": "Delete Question",
          "disable": "Disable",
          "edit": "Edit Question",
          "enable": "Enable",
          "new": "New Question",
          "new_assign": "Assign Question",
          "title": "Question's options"
        }
      }
    },
    "tenancies": "Tenancies",
    "threesixty_campaigns": {
      "email_templates": {
        "approve_nomination": {
          "description": "This message is sent to a manager when a nomination, made by a direct report, needs to be approved",
          "name": "Approve Nomination"
        },
        "approve_report": {
          "description": "This message is sent to a subject's manager to notify them that the subjects report is ready for approval",
          "name": "Approve Report"
        },
        "categories": {
          "approvals": "Approvals",
          "invitations": "Invitations",
          "reminders": "Reminders",
          "report_ready": "Report Ready"
        },
        "custom_message": {
          "description": "This message can be sent to anyone participating in the assessment",
          "name": "Custom Message"
        },
        "days_repeated": "days, repeated",
        "evaluator_invite": {
          "description": "This message will be sent to all participants that are evaluators",
          "name": "Evaluator Invite"
        },
        "evaluator_reminder": {
          "description": "This message will be sent to remind evaluators to complete pending evaluations",
          "name": "Evaluator Reminder",
          "rule_description": "Specify rules for automatically scheduling when an invitation is scheduled",
          "rule_name": "Evaluator Reminder Rules"
        },
        "from": "From",
        "manager_report_ready": {
          "description": "This message is sent to a subject's manager once the subject's report is ready",
          "name": "Manager Report Ready"
        },
        "nomination_denied": {
          "description": "This message is sent to subjects when a nomination is denied",
          "name": "Nomination Denied"
        },
        "reply_to_email": "Reply to email",
        "request_approval": {
          "description": "This message is sent to managers when a subject requests approval",
          "name": "Request Approval"
        },
        "schedule_email": "Schedule Email",
        "send_test_email": "Send Test Email",
        "subject": "Subject",
        "subject_invite": {
          "description": "This message will be sent to invite subjects to participate in the assessment",
          "name": "Subject Invite"
        },
        "subject_reminder": {
          "description": "Message sent to each participant to remind them to participate in the assessment",
          "name": "Subject Reminder",
          "rule_description": "Specify rules for automatically scheduling when an invitation is scheduled",
          "rule_name": "Subject Reminder Rules"
        },
        "subject_report_ready": {
          "description": "This message is sent to a subject once their report is ready",
          "name": "Subject Report Ready"
        },
        "times": "times"
      },
      "instruction_templates": {
        "evaluate_others": {
          "description": "This message will be displayed when participants are evaluating others from inside the portal",
          "name": "Evaluate Others"
        },
        "evaluate_self": {
          "description": "This message will be displayed to subjects when they begin their self-evaluation",
          "name": "Evaluator Self"
        },
        "evaluator_welcome": {
          "description": "This message will override the \"Welcome Message\" and be displayed to participants who are currently participating as evaluators only.",
          "name": "Evaluator welcome"
        },
        "invite_evaluators": {
          "description": "This message will be displayed to subjects when they begin nominating evaluators",
          "name": "Invite Evaluators"
        },
        "welcome_message": {
          "description": "This message will be displayed to subjects when they log in to begin the assessment or view their task list",
          "name": "Welcome Message"
        }
      }
    },
    "translations": {
      "assessments": {
        "new": {
          "header": "Import Translations"
        }
      },
      "import": {
        "successfully": "Translations was successfully imported"
      }
    },
    "tte": "TTE",
    "uniq_id": "Uniq ID",
    "update": "Update",
    "updated": "Successfully updated",
    "users": {
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully deleted."
      },
      "edit": {
        "add": "Add",
        "grants": "Privileges",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "form": {
        "choose": " - Choose - "
      },
      "index": {
        "breadcrumb": "Users",
        "export": "Export",
        "export_completion_status": "Completion Status",
        "export_users": "Users",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "new": "Add",
        "new_superadmin": "Add SuperAdmin",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "list": {
        "created_at": "Created Date",
        "updated_at": "Modified Date"
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "resource": {
        "confirmations": {
          "change_password": {
            "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
            "title": "Change password <strong>%{name}</strong> ?"
          },
          "delete": {
            "body": "<p>Are you sure you want to delete this User?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "membership": {
            "delete": {
              "body": "<p>Are you sure you want to delete?</p>\n",
              "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
            }
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this User?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "change_password": "Change Password",
          "chart": "View user report",
          "delete": "Delete User",
          "edit": "Edit User",
          "mail": "Send Mail",
          "sign_in": "Login as user"
        }
      },
      "sidebar": {
        "api_keys": "API keys",
        "assessments_and_reports": "Assessments and Reporting",
        "destroy": "Delete User",
        "disable": "Disable",
        "edit_user": "Edit User",
        "email": "Send Mail",
        "enable": "Enable",
        "export_users": "Export users",
        "import_users": "Import users",
        "login_as_user": "Login as User",
        "new_user": "New User",
        "reset_password": "Change Password",
        "title": "User's options"
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    }
  },
  "assessments": {
    "decorator": {
      "no_description": "Description is empty"
    },
    "index": {
      "managers_assessments_button": "Action Planning",
      "managers_dashboard_button": "Managers Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "resource": {
      "assigned": "Assigned %{date}",
      "invite_users": "Invite Users",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "results": "Results",
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start"
      }
    }
  },
  "assigns": {
    "assign": {
      "accept_privacy_modal": {
        "accept": "Accept",
        "reject": "Reject",
        "text": "In completing this questionnaire(s), you are consenting for any data collected as a result to be used for the purposes intended and described in the communication you have already received. Your responses to the questions asked, along with any other associated data provided, will be used for the purposes of analysing and reporting your individual responses. We may also use your responses as part of large scale research projects. Your data will be treated with the requisite sensitivity and security. Please click <a href='https://thetalententerprise.com/privacy-statement/' target='_blank'>here</a> / go to this website to find out more or to contact someone for any more specific queries you may have.",
        "title": "Data processing consent"
      },
      "assigned": "Assigned %{date}",
      "mindmill_confirmation": "Starting this assessment you will lost results \"%{assessment}\". Click \"Cancel\" if you want leave results, and click \"Ok\" if you want continue",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start",
        "overdue": "Overdue"
      }
    },
    "assigns_reports": {
      "download": "Download",
      "duration": "Duration",
      "progress": "Progress",
      "summary_report": "Summary report"
    },
    "decorator": {
      "completed": "Completed %{date}",
      "no_description": "Description is empty",
      "not_completed": "Not Completed"
    },
    "index": {
      "managers_dashboard_button": "Managers Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "multiple_report": {
      "results": "Results"
    },
    "notifications": {
      "completed": "%{user_name} finished assessment \"%{assessment_name}\"",
      "in_progress": "%{user_name} started to take assessment \"%{assessment_name}\""
    },
    "project_assessment": {
      "accept_privacy_modal": {
        "accept": "Accept",
        "reject": "Reject",
        "text": "In completing this questionnaire(s), you are consenting for any data collected as a result to be used for the purposes intended and described in the communication you have already received. Your responses to the questions asked, along with any other associated data provided, will be used for the purposes of analysing and reporting your individual responses. We may also use your responses as part of large scale research projects. Your data will be treated with the requisite sensitivity and security. Please click <a href='https://thetalententerprise.com/privacy-statement/' target='_blank'>here</a> / go to this website to find out more or to contact someone for any more specific queries you may have.",
        "title": "Data processing consent"
      },
      "assigned": "Assigned %{date}",
      "mindmill_confirmation": "Starting this assessment you will lost results \"%{assessment}\". Click \"Cancel\" if you want leave results, and click \"Ok\" if you want continue",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start",
        "overdue": "Overdue"
      }
    },
    "reports": {
      "load_results": "Load Results: %{report}",
      "processing": "Processing...",
      "results": "Results"
    }
  },
  "ckeditor": {
    "buttons": {
      "cancel": "Cancel",
      "delete": "Delete",
      "next": "Next",
      "upload": "Upload"
    },
    "confirm_delete": "Delete file?",
    "page_title": "CKEditor Files Manager"
  },
  "clear_filter": "Clear Filter",
  "confirmation": {
    "default_body": "Are you sure?",
    "default_title": "Confirmation"
  },
  "currencies": {
    "AED": "AED",
    "BHD": "BHD",
    "BYN": "BYN",
    "EUR": "EUR",
    "GBP": "GBP",
    "INR": "INR",
    "KWD": "KWD",
    "OMR": "OMR",
    "QAR": "QAR",
    "SAR": "SAR",
    "USD": "USD"
  },
  "date": {
    "abbr_day_names": [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "abbr_month_names": [
      null,
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    "day_names": [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "formats": {
      "default": "%Y-%m-%d",
      "long": "%B %d, %Y",
      "short": "%b %d"
    },
    "month_names": [
      null,
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    "order": [
      "year",
      "month",
      "day"
    ]
  },
  "datetime": {
    "distance_in_words": {
      "about_x_hours": {
        "one": "about 1 hour",
        "other": "about %{count} hours"
      },
      "about_x_months": {
        "one": "about 1 month",
        "other": "about %{count} months"
      },
      "about_x_years": {
        "one": "about 1 year",
        "other": "about %{count} years"
      },
      "almost_x_years": {
        "one": "almost 1 year",
        "other": "almost %{count} years"
      },
      "half_a_minute": "half a minute",
      "less_than_x_minutes": {
        "one": "less than a minute",
        "other": "less than %{count} minutes"
      },
      "less_than_x_seconds": {
        "one": "less than 1 second",
        "other": "less than %{count} seconds"
      },
      "over_x_years": {
        "one": "over 1 year",
        "other": "over %{count} years"
      },
      "x_days": {
        "one": "1 day",
        "other": "%{count} days"
      },
      "x_minutes": {
        "one": "1 minute",
        "other": "%{count} minutes"
      },
      "x_months": {
        "one": "1 month",
        "other": "%{count} months"
      },
      "x_seconds": {
        "one": "1 second",
        "other": "%{count} seconds"
      }
    },
    "prompts": {
      "day": "Day",
      "hour": "Hour",
      "minute": "Minute",
      "month": "Month",
      "second": "Seconds",
      "year": "Year"
    }
  },
  "devise": {
    "administrators": {
      "meta_title": "Login to administration panel",
      "passwords": {
        "edit": {
          "submit": "Set new password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "submit": "Send me instructions",
          "title": "Forgot your password?"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": "Contact Us",
          "privacy": "Privacy"
        }
      }
    },
    "confirmations": {
      "confirmed": "Your email address has been successfully confirmed.",
      "new": {
        "resend_confirmation_instructions": "Resend confirmation instructions"
      },
      "send_instructions": "You will receive an email with instructions for how to confirm your email address in a few minutes.",
      "send_paranoid_instructions": "If your email address exists in our database, you will receive an email with instructions for how to confirm your email address in a few minutes."
    },
    "failure": {
      "already_authenticated": "You are already signed in.",
      "inactive": "Your account is not activated yet.",
      "invalid": "Invalid %{authentication_keys} or password.",
      "invited": "You have a pending invitation, accept it to finish creating your account.",
      "last_attempt": "You have one more attempt before your account is locked.",
      "locked": "Your account is locked.",
      "not_found_in_database": "Invalid %{authentication_keys} or password.",
      "timeout": "Your session expired. Please login again to continue.",
      "unauthenticated": "You need to login or register before continuing.",
      "unconfirmed": "You have to confirm your email address before continuing."
    },
    "invitations": {
      "edit": {
        "confirm_password_label": "Confirm Password",
        "description": "To create a new password, please enter your new password in the boxes below.",
        "header": "Set your password",
        "password_label": "Password",
        "submit": "Set New Password",
        "submit_button": "Set my password",
        "title": "Create password"
      },
      "invitation_removed": "Your invitation was removed.",
      "invitation_token_invalid": "The invitation token provided is not valid!",
      "new": {
        "header": "Send invitation",
        "submit_button": "Send an invitation"
      },
      "no_invitations_remaining": "No invitations remaining",
      "send_instructions": "An invitation email has been sent to %{email}.",
      "updated": "Your password was set successfully. You are now signed in.",
      "updated_not_active": "Your password was set successfully."
    },
    "mailer": {
      "confirmation_instructions": {
        "action": "Confirm my account",
        "greeting": "Welcome %{recipient}!",
        "instruction": "You can confirm your account email through the link below:",
        "subject": "Confirmation instructions"
      },
      "email_changed": {
        "subject": "Email Changed"
      },
      "invitation_instructions": {
        "accept": "Accept invitation",
        "accept_until": "This invitation will be due in %{due_date}.",
        "hello": "Hello %{email}",
        "ignore": "If you don't want to accept the invitation, please ignore this email.<br />\\nYour account won't be created until you access the link above and set your password.",
        "someone_invited_you": "Someone has invited you to %{url}, you can accept it through the link below.",
        "subject": "The Talent Enterprise – Your Link to Thriving Index"
      },
      "password_change": {
        "greeting": "Hello %{recipient}!",
        "message": "We're contacting you to notify you that your password has been changed.",
        "subject": "Password Changed"
      },
      "reset_password_instructions": {
        "action": "Change my password",
        "greeting": "Hello %{recipient}!",
        "instruction": "Someone has requested a link to change your password, and you can do this through the link below.",
        "instruction_2": "If you didn't request this, please ignore this email.",
        "instruction_3": "Your password won't change until you access the link above and create a new one.",
        "subject": "Reset password instructions"
      },
      "unlock_instructions": {
        "action": "Unlock my account",
        "greeting": "Hello %{recipient}!",
        "instruction": "Click the link below to unlock your account:",
        "message": "Your account has been locked due to an excessive amount of unsuccessful sign in attempts.",
        "subject": "Unlock instructions"
      }
    },
    "omniauth_callbacks": {
      "failure": "Could not authenticate you from %{kind} because \"%{reason}\".",
      "success": "Successfully authenticated from %{kind} account."
    },
    "passwords": {
      "edit": {
        "change_my_password": "Change my password",
        "change_your_password": "Change your password",
        "confirm_new_password": "Confirm new password",
        "description": "To create a new password, please enter your new password in the boxes below.",
        "new_password": "New password",
        "title": "Create Password"
      },
      "new": {
        "back": "Return back",
        "description": "Please enter your email address in the box below and click 'Reset Password'.",
        "email_label": "Email Address",
        "forgot_your_password": "Forgot your password?",
        "send_me_reset_password_instructions": "Send me reset password instructions",
        "submit": "Reset Password",
        "title": "Forgotten Password"
      },
      "no_token": "You can't access this page without coming from a password reset email. If you do come from a password reset email, please make sure you used the full URL provided.",
      "send_instructions": "You will receive an email with instructions on how to reset your password in a few minutes.",
      "send_paranoid_instructions": "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.",
      "updated": "Your password has been changed successfully. You are now signed in.",
      "updated_not_active": "Your password has been changed successfully."
    },
    "registrations": {
      "destroyed": "Bye! Your account has been successfully cancelled. We hope to see you again soon.",
      "edit": {
        "are_you_sure": "Are you sure?",
        "cancel_my_account": "Cancel my account",
        "currently_waiting_confirmation_for_email": "Currently waiting confirmation for: %{email}",
        "leave_blank_if_you_don_t_want_to_change_it": "leave blank if you don't want to change it",
        "title": "Edit %{resource}",
        "unhappy": "Unhappy",
        "update": "Update",
        "we_need_your_current_password_to_confirm_your_changes": "we need your current password to confirm your changes"
      },
      "new": {
        "sign_up": "Sign up",
        "submit": "Register",
        "tabs": {
          "register": "Register",
          "sign_in": "Sign In"
        }
      },
      "signed_up": "Welcome! You have signed up successfully.",
      "signed_up_but_inactive": "You have signed up successfully. However, we could not sign you in because your account is not yet activated.",
      "signed_up_but_locked": "You have signed up successfully. However, we could not sign you in because your account is locked.",
      "signed_up_but_unconfirmed": "A message with a confirmation link has been sent to your email address. Please follow the link to activate your account.",
      "update_needs_confirmation": "You updated your account successfully, but we need to verify your new email address. Please check your email and follow the confirm link to confirm your new email address.",
      "updated": "Your account has been updated successfully."
    },
    "sessions": {
      "already_signed_out": "Signed out successfully.",
      "new": {
        "email_label": "Email Address",
        "forgot_password": "Forgot password?",
        "keep_sign_in": "Yes, Keep me signed in",
        "password_placeholder": "Enter your password",
        "sign_in": "Sign in",
        "submit": "Login",
        "tabs": {
          "register": "Register",
          "sign_in": "Login"
        }
      },
      "signed_in": "Signed in successfully.",
      "signed_out": "Signed out successfully."
    },
    "shared": {
      "links": {
        "back": "Back",
        "didn_t_receive_confirmation_instructions": "Didn't receive confirmation instructions?",
        "didn_t_receive_unlock_instructions": "Didn't receive unlock instructions?",
        "forgot_your_password": "Forgot your password?",
        "sign_in": "Sign in",
        "sign_in_with_provider": "Sign in with %{provider}",
        "sign_up": "Sign up"
      }
    },
    "unlocks": {
      "new": {
        "resend_unlock_instructions": "Resend unlock instructions"
      },
      "send_instructions": "You will receive an email with instructions for how to unlock your account in a few minutes.",
      "send_paranoid_instructions": "If your account exists, you will receive an email with instructions for how to unlock it in a few minutes.",
      "unlocked": "Your account has been unlocked successfully. Please login to continue."
    }
  },
  "ecommerce": {
    "carts": {
      "show": {
        "back_to_catalogue": "Back to Catalogue",
        "next": "Next",
        "shopping_basket": "Shopping Basket",
        "total": "Total:",
        "update_basket": "Update Basket"
      }
    },
    "orders": {
      "new": {
        "back_to_basket": "Back to Basket",
        "order": "Order",
        "pay": "Pay",
        "product_name": "Product Name",
        "product_price": "Product Price",
        "product_quantity": "Quantity",
        "product_subtotal": "Positions Price",
        "total": "Total",
        "users": "Users"
      },
      "success": {
        "back_to_basket": "Back to Basket",
        "body": "<h3>Payment successful</h3>\n<p>We will email you a receipt confirming your oder shortly.</p>\n",
        "go_to_dashboard": "Go to Dashboard",
        "title": "Payment Successful"
      }
    },
    "products": {
      "add_to_cart": {
        "successfully": "Assessment was successfuly added to the basket"
      },
      "index": {
        "assessment_catalogue": "Assessment Catalogue",
        "shopping_basket": "Shopping Basket"
      }
    },
    "users": {
      "registrations": {
        "new": {
          "register": "Register",
          "sign_in": "Sign in"
        }
      },
      "sessions": {
        "new": {
          "register": "Register",
          "sign_in": "Sign in"
        }
      }
    }
  },
  "enums": {
    "communication": {
      "delivery_rule": {
        "in_progress": "If assessment is in progress",
        "not_competed": "If assessment is not completed",
        "not_started": "If assessment is not started",
        "send_now": "Send now",
        "specific_datetime": "Send at"
      },
      "kind": {
        "completion": "Completion",
        "invitation": "Invitation",
        "other": "Other",
        "reminder": "Reminder"
      },
      "recipients": {
        "all": "All",
        "selected": "Selected"
      }
    },
    "report": {
      "type": {
        "common": "Any",
        "eti": "ETI",
        "yti": "YTI"
      }
    }
  },
  "errors": {
    "connection_refused": "Oops! Failed to connect to the Web Console middleware.\nPlease make sure a rails development server is running.\n",
    "error_500": "Something went wrong. Contact your administrator.",
    "format": "%{attribute} %{message}",
    "invalid_token": "Something went wrong. Plese reload the page and try again.",
    "messages": {
      "accepted": "must be accepted",
      "after": "must be after %{date}",
      "after_or_equal_to": "must be after or equal to %{date}",
      "allowed_file_content_types": "file should be one of %{types}",
      "already_confirmed": "was already confirmed, please try signing in",
      "before": "must be before %{date}",
      "before_or_equal_to": "must be before or equal to %{date}",
      "blank": "can't be blank",
      "carrierwave_direct_allowed_extensions": "Allowed file types are %{extensions}",
      "carrierwave_direct_allowed_schemes": "Allowed schemes are %{schemes}",
      "carrierwave_direct_attachment_missing": "attachment is missing",
      "carrierwave_direct_filename_invalid": "is invalid. ",
      "carrierwave_direct_filename_taken": "filename was already taken",
      "carrierwave_direct_upload_missing": "upload is missing",
      "carrierwave_download_error": "could not be downloaded",
      "carrierwave_integrity_error": "is not of an allowed file type",
      "carrierwave_processing_error": "failed to be processed",
      "confirmation": "doesn't match %{attribute}",
      "confirmation_period_expired": "needs to be confirmed within %{period}, please request a new one",
      "content_type_blacklist_error": "You are not allowed to upload %{content_type} files",
      "content_type_whitelist_error": "You are not allowed to upload %{content_type} files",
      "empty": "can't be empty",
      "equal_to": "must be equal to %{date}",
      "even": "must be even",
      "excluded_file_content_types": "file cannot be %{types}",
      "exclusion": "is reserved",
      "expired": "has expired, please request a new one",
      "extension_blacklist_error": "You are not allowed to upload %{extension} files, prohibited types: %{prohibited_types}",
      "extension_whitelist_error": "You are not allowed to upload %{extension} files, allowed types: %{allowed_types}",
      "file_size_is_greater_than": "file size must be greater than %{count}",
      "file_size_is_greater_than_or_equal_to": "file size must be greater than or equal to %{count}",
      "file_size_is_in": "file size must be between %{min} and %{max}",
      "file_size_is_less_than": "file size must be less than %{count}",
      "file_size_is_less_than_or_equal_to": "file size must be less than or equal to %{count}",
      "greater_than": "must be greater than %{count}",
      "greater_than_or_equal_to": "must be greater than or equal to %{count}",
      "inclusion": "is not included in the list",
      "invalid": "is invalid",
      "invalid_currency": "must be a valid currency (eg. '100', '5%{decimal}24', or '123%{thousands}456%{decimal}78'). Got %{currency}",
      "less_than": "must be less than %{count}",
      "less_than_or_equal_to": "must be less than or equal to %{count}",
      "max_size_error": "File size should be less than %{max_size}",
      "min_size_error": "File size should be greater than %{min_size}",
      "mini_magick_processing_error": "Failed to manipulate with MiniMagick, maybe it is not an image? Original Error: %{e}",
      "model_invalid": "Validation failed: %{errors}",
      "not_a_date": "is not a date",
      "not_a_number": "is not a number",
      "not_an_integer": "must be an integer",
      "not_found": "not found",
      "not_locked": "was not locked",
      "not_saved": {
        "one": "1 error prohibited this %{resource} from being saved:",
        "other": "%{count} errors prohibited this %{resource} from being saved:"
      },
      "odd": "must be odd",
      "other_than": "must be other than %{count}",
      "present": "must be blank",
      "required": "must exist",
      "rmagick_processing_error": "Failed to manipulate with rmagick, maybe it is not an image?",
      "taken": "has already been taken",
      "too_long": {
        "one": "is too long (maximum is 1 character)",
        "other": "is too long (maximum is %{count} characters)"
      },
      "too_short": {
        "one": "is too short (minimum is 1 character)",
        "other": "is too short (minimum is %{count} characters)"
      },
      "wrong_length": {
        "one": "is the wrong length (should be 1 character)",
        "other": "is the wrong length (should be %{count} characters)"
      }
    },
    "try_again": "Please try again",
    "unacceptable_request": "A supported version is expected in the Accept header.\n",
    "unavailable_session": "Session %{id} is is no longer available in memory.\n\nIf you happen to run on a multi-process server (like Unicorn or Puma) the process\nthis request hit doesn't store %{id} in memory. Consider turning the number of\nprocesses/workers to one (1) or using a different server in development.\n"
  },
  "flash": {
    "actions": {
      "create": {
        "notice": "%{resource_name} was successfully created."
      },
      "destroy": {
        "alert": "%{resource_name} could not be destroyed.",
        "notice": "%{resource_name} was successfully destroyed."
      },
      "update": {
        "notice": "%{resource_name} was successfully updated."
      }
    }
  },
  "helpers": {
    "page_entries_info": {
      "more_pages": {
        "display_entries": "Displaying %{entry_name} <b>%{first}&nbsp;-&nbsp;%{last}</b> of <b>%{total}</b> in total"
      },
      "one_page": {
        "display_entries": {
          "one": "Displaying <b>1</b> %{entry_name}",
          "other": "Displaying <b>all %{count}</b> %{entry_name}",
          "zero": "No %{entry_name} found"
        }
      }
    },
    "select": {
      "prompt": "Please select"
    },
    "submit": {
      "create": "Create %{model}",
      "submit": "Save %{model}",
      "update": "Update %{model}"
    }
  },
  "hogan": {
    "assigns": {
      "results": {
        "not_completed": "Hogan Report isn't ready yet",
        "successfully": "Hogan Report was successfully saved"
      }
    }
  },
  "home": {
    "survey_instructions": {
      "title": "Instructions"
    }
  },
  "i18n_tasks": {
    "add_missing": {
      "added": {
        "one": "Added %{count} key",
        "other": "Added %{count} keys"
      }
    },
    "cmd": {
      "args": {
        "default_text": "Default: %{value}",
        "desc": {
          "all_locales": "Do not expect key patterns to start with a locale, instead apply them to all locales implicitly.",
          "confirm": "Confirm automatically",
          "data_format": "Data format: %{valid_text}.",
          "keep_order": "Keep the order of the keys",
          "key_pattern": "Filter by key pattern (e.g. 'common.*')",
          "key_pattern_to_rename": "Full key (pattern) to rename. Required",
          "locale": "i18n_tasks.common.locale",
          "locale_to_translate_from": "Locale to translate from",
          "locales_filter": "Locale(s) to process. Special: base",
          "missing_types": "Filter by types: %{valid}",
          "new_key_name": "New name, interpolates original name as %{key}. Required",
          "nostdin": "Do not read from stdin",
          "out_format": "Output format: %{valid_text}",
          "pattern_router": "Use pattern router: keys moved per config data.write",
          "strict": "Avoid inferring dynamic key usages such as t(\"cats.#{cat}.name\"). Takes precedence over the config setting if set.",
          "translation_backend": "Translation backend (google or deepl)",
          "value": "Value. Interpolates: %{value}, %{human_key}, %{key}, %{default}, %{value_or_human_key}, %{value_or_default_or_human_key}"
        }
      },
      "desc": {
        "add_missing": "add missing keys to locale data",
        "check_consistent_interpolations": "verify that all translations use correct interpolation variables",
        "check_normalized": "verify that all translation data is normalized",
        "config": "display i18n-tasks configuration",
        "data": "show locale data",
        "data_merge": "merge locale data with trees",
        "data_remove": "remove keys present in tree from data",
        "data_write": "replace locale data with tree",
        "eq_base": "show translations equal to base value",
        "find": "show where keys are used in the code",
        "gem_path": "show path to the gem",
        "health": "is everything OK?",
        "irb": "start REPL session within i18n-tasks context",
        "missing": "show missing translations",
        "mv": "rename/merge the keys in locale data that match the given pattern",
        "normalize": "normalize translation data: sort and move to the right files",
        "remove_unused": "remove unused keys",
        "rm": "remove the keys in locale data that match the given pattern",
        "translate_missing": "translate missing keys with Google Translate or DeepL Pro",
        "tree_convert": "convert tree between formats",
        "tree_filter": "filter tree by key pattern",
        "tree_merge": "merge trees",
        "tree_mv_key": "rename/merge/remove the keys matching the given pattern",
        "tree_set_value": "set values of keys, optionally match a pattern",
        "tree_subtract": "tree A minus the keys in tree B",
        "tree_translate": "Google Translate a tree to root locales",
        "unused": "show unused translations"
      },
      "encourage": [
        "Good job!",
        "Well done!",
        "Perfect!"
      ],
      "enum_list_opt": {
        "invalid": "%{invalid} is not in: %{valid}."
      },
      "enum_opt": {
        "invalid": "%{invalid} is not one of: %{valid}."
      },
      "errors": {
        "invalid_format": "invalid format: %{invalid}. valid: %{valid}.",
        "invalid_locale": "invalid locale: %{invalid}",
        "invalid_missing_type": {
          "one": "invalid type: %{invalid}. valid: %{valid}.",
          "other": "unknown types: %{invalid}. valid: %{valid}."
        },
        "pass_forest": "pass locale forest"
      }
    },
    "common": {
      "continue_q": "Continue?",
      "key": "Key",
      "locale": "Locale",
      "n_more": "%{count} more",
      "value": "Value"
    },
    "data_stats": {
      "text": "has %{key_count} keys across %{locale_count} locales. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments, a locale has %{per_locale_avg} keys.",
      "text_single_locale": "has %{key_count} keys in total. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments.",
      "title": "Forest (%{locales})"
    },
    "deepl_translate": {
      "errors": {
        "no_api_key": "Setup DeepL Pro API key via DEEPL_AUTH_KEY environment variable or translation.deepl_api_key in config/i18n-tasks.yml. Get the key at https://www.deepl.com/pro.",
        "no_results": "DeepL returned no results."
      }
    },
    "google_translate": {
      "errors": {
        "no_api_key": "Set Google API key via GOOGLE_TRANSLATE_API_KEY environment variable or translation.google_translate_api_key in config/i18n-tasks.yml. Get the key at https://code.google.com/apis/console.",
        "no_results": "Google Translate returned no results. Make sure billing information is set at https://code.google.com/apis/console."
      }
    },
    "health": {
      "no_keys_detected": "No keys detected. Check data.read in config/i18n-tasks.yml."
    },
    "inconsistent_interpolations": {
      "none": "No inconsistent interpolations found."
    },
    "missing": {
      "details_title": "Value in other locales or source",
      "none": "No translations are missing."
    },
    "remove_unused": {
      "confirm": {
        "one": "%{count} translation will be removed from %{locales}.",
        "other": "%{count} translation will be removed from %{locales}."
      },
      "noop": "No unused keys to remove",
      "removed": "Removed %{count} keys"
    },
    "translate_missing": {
      "translated": "Translated %{count} keys"
    },
    "unused": {
      "none": "Every translation is in use."
    },
    "usages": {
      "none": "No key usages found."
    }
  },
  "invites": {
    "create": {
      "successfully": "Your invitations was successfully sent"
    },
    "form": {
      "emails_hint": "Set each email in new line",
      "send_invites": "Send Invites"
    },
    "new": {
      "header": "Invite Form"
    }
  },
  "jobs": {
    "threesixty": {
      "reports": {
        "download": {
          "description": "To download the report, please follow link: <a href='%{url}' target='_blank'>Download</a>",
          "message": "Report is ready"
        }
      }
    }
  },
  "languages": {
    "ar": "Arabic",
    "bg": "Bulgarian",
    "bs": "Bosnian",
    "ca": "Catalan",
    "cn": "Chinese",
    "cs": "Czech",
    "cy": "Welsh",
    "da": "Danish",
    "de": "German",
    "el": "Greek",
    "en": "English",
    "en-GB": "English - UK",
    "eo": "Esperanto",
    "es": "Spanish (Latin America)",
    "es-ES": "Spanish (Spain)",
    "et": "Estonian",
    "fa": "Persian",
    "fi": "Finnish",
    "fr": "French",
    "gu": "Gujarati",
    "he": "Hebrew",
    "hi": "Hindi",
    "hr": "Croatian",
    "hu": "Hungarian",
    "id": "Bahasa Indonesia",
    "it": "Italian",
    "ja": "Japanese",
    "km": "Khmer",
    "ko": "Korean",
    "lt": "Lithuanian",
    "lv": "Latvian",
    "mk": "Macedonian",
    "mn": "Mongolian",
    "ms": "Bahasa Malaysia",
    "my": "Myanmar",
    "nl": "Dutch",
    "no": "Norwegian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pt-BR": "Brazilian Portuguese",
    "ro": "Romanian",
    "ru": "Russian",
    "sk": "Slovak",
    "sl": "Slovenian",
    "sr": "Serbian",
    "sv": "Swedish",
    "sw": "Swahili",
    "ta": "Tamil",
    "th": "Thai",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "vi": "Vietnamese",
    "zh": "Chinese Simplified",
    "zh-TW": "Chinese Traditional"
  },
  "layouts": {
    "users": {
      "dashboard": "Dashboard",
      "help": "Help",
      "logout": "Log Out",
      "menu": "Menu",
      "notifications": "Notifications",
      "profile": "Profile"
    }
  },
  "loading": "Processing...",
  "mailer": {
    "from": "The Talent Enterprise"
  },
  "managers": {
    "assessments": {
      "index": {
        "actions": "Actions",
        "name": "Name"
      },
      "resource": {
        "action_planning": "Action Planning"
      }
    },
    "assigns": {
      "index": {
        "title": "Assessments and Reporting Centre"
      },
      "list": {
        "action": "Action",
        "assessment_name": "Assessment Name",
        "assessment_type": "Assessment Type",
        "completion_date": "Completion Date",
        "name": "Name",
        "status": "Completion Status"
      },
      "resource": {
        "email": "Email",
        "save": "Save in PDF",
        "view": "View"
      }
    },
    "dashboard": {
      "index": {
        "assessment_center": "Assessment / Report Centre",
        "notification_center": "Notification Centre",
        "notifications": "Notifications",
        "relationships": "Company Relationships",
        "reporting": "Reporting",
        "statistics": "Statistics"
      }
    },
    "notifications": {
      "index": {
        "subtitle": "Notifications",
        "title": "Notification Centre"
      }
    },
    "reports": {
      "show": {
        "export_pdf": "Export to PDF",
        "header": "Report"
      }
    },
    "statistics": {
      "index": {
        "title": "Statistics"
      }
    },
    "tasks": {
      "comment": {
        "made_comment": "made a comment."
      },
      "edit": {
        "header": "Update Action Item"
      },
      "index": {
        "subtitle": "Action Items",
        "title": "Action Planning Dashboard",
        "tooltips": {
          "create": "Create"
        }
      },
      "list": {
        "actions": "Actions",
        "add_item": "Add Action Item",
        "competency": "Competency",
        "high": "High Priority",
        "low": "Low Priority",
        "medium": "Medium Priority",
        "subtitle_high": "High Priority Items",
        "subtitle_low": "Low Priority Items",
        "subtitle_medium": "Medium Priority Items",
        "summary": "Showing %{total} of %{total} entries."
      },
      "new": {
        "header": "Create Action Item"
      },
      "resource": {
        "tooltips": {
          "delete": "Delete Action Item",
          "edit": "Edit Action Item"
        }
      },
      "resource_extension": {
        "add": "Add Sub Action Item",
        "add_comment": "Add Comment",
        "leave_comment": "Leave a comment/note:",
        "notes": "Notes/Comments:",
        "sub_tasks": "Sub Action Items"
      },
      "subtasks": {
        "list": {
          "actions": "Actions",
          "date": "Target Completion Date",
          "name": "Action Item",
          "status": "Status"
        }
      },
      "summary": {
        "completed": "Completed",
        "in_progress": "In Progress",
        "manager_summary": "Manager Summary",
        "not_started": "Not Started",
        "overdue": "Overdue",
        "total": "Total Items"
      },
      "summary_managers": {
        "assignee": "Assigner",
        "completed": "Completed",
        "in_progress": "In Progress",
        "not_started": "Not Started",
        "overdue": "Overdue"
      }
    },
    "users": {
      "index": {
        "title": "Company Relationships"
      }
    }
  },
  "mindmill": {
    "assigns": {
      "results": {
        "not_completed": "Mindmill Assessment not completed",
        "successfully": "Mindmill Assessment was successfully pass"
      }
    }
  },
  "next": "Next",
  "no": "No",
  "number": {
    "currency": {
      "format": {
        "delimiter": ",",
        "format": "%u%n",
        "precision": 2,
        "separator": ".",
        "significant": false,
        "strip_insignificant_zeros": false,
        "unit": "$"
      }
    },
    "format": {
      "delimiter": ",",
      "precision": 3,
      "separator": ".",
      "significant": false,
      "strip_insignificant_zeros": false
    },
    "human": {
      "decimal_units": {
        "format": "%n %u",
        "units": {
          "billion": "Billion",
          "million": "Million",
          "quadrillion": "Quadrillion",
          "thousand": "Thousand",
          "trillion": "Trillion",
          "unit": ""
        }
      },
      "format": {
        "delimiter": "",
        "precision": 3,
        "significant": true,
        "strip_insignificant_zeros": true
      },
      "storage_units": {
        "format": "%n %u",
        "units": {
          "byte": {
            "one": "Byte",
            "other": "Bytes"
          },
          "eb": "EB",
          "gb": "GB",
          "kb": "KB",
          "mb": "MB",
          "pb": "PB",
          "tb": "TB"
        }
      }
    },
    "percentage": {
      "format": {
        "delimiter": "",
        "format": "%n%"
      }
    },
    "precision": {
      "format": {
        "delimiter": ""
      }
    }
  },
  "profiles": {
    "edit": {
      "header": "Profile Settings"
    },
    "form": {
      "username": "Username"
    },
    "update": {
      "successfully": "Profile updated"
    }
  },
  "ransack": {
    "all": "all",
    "and": "and",
    "any": "any",
    "asc": "ascending",
    "attribute": "attribute",
    "combinator": "combinator",
    "condition": "condition",
    "desc": "descending",
    "or": "or",
    "predicate": "predicate",
    "predicates": {
      "blank": "is blank",
      "cont": "contains",
      "cont_all": "contains all",
      "cont_any": "contains any",
      "does_not_match": "doesn't match",
      "does_not_match_all": "doesn't match all",
      "does_not_match_any": "doesn't match any",
      "end": "ends with",
      "end_all": "ends with all",
      "end_any": "ends with any",
      "eq": "equals",
      "eq_all": "equals all",
      "eq_any": "equals any",
      "false": "is false",
      "gt": "greater than",
      "gt_all": "greater than all",
      "gt_any": "greater than any",
      "gteq": "greater than or equal to",
      "gteq_all": "greater than or equal to all",
      "gteq_any": "greater than or equal to any",
      "in": "in",
      "in_all": "in all",
      "in_any": "in any",
      "lt": "less than",
      "lt_all": "less than all",
      "lt_any": "less than any",
      "lteq": "less than or equal to",
      "lteq_all": "less than or equal to all",
      "lteq_any": "less than or equal to any",
      "matches": "matches",
      "matches_all": "matches all",
      "matches_any": "matches any",
      "not_cont": "doesn't contain",
      "not_cont_all": "doesn't contain all",
      "not_cont_any": "doesn't contain any",
      "not_end": "doesn't end with",
      "not_end_all": "doesn't end with all",
      "not_end_any": "doesn't end with any",
      "not_eq": "not equal to",
      "not_eq_all": "not equal to all",
      "not_eq_any": "not equal to any",
      "not_in": "not in",
      "not_in_all": "not in all",
      "not_in_any": "not in any",
      "not_null": "is not null",
      "not_start": "doesn't start with",
      "not_start_all": "doesn't start with all",
      "not_start_any": "doesn't start with any",
      "null": "is null",
      "present": "is present",
      "start": "starts with",
      "start_all": "starts with all",
      "start_any": "starts with any",
      "true": "is true"
    },
    "search": "search",
    "sort": "sort",
    "value": "value"
  },
  "reports": {
    "modules": {
      "common": {
        "almost_always": "Almost Always",
        "less_typical": "Less Typical",
        "moderate": "Moderate",
        "more_typical": "More Typical",
        "rare": "Rare"
      },
      "cpi_occupations": {
        "occupations": "Occupations",
        "your_potential_suitability": "Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "Gap",
        "item": "Item",
        "negative_gap": "Negative Gaps",
        "no_negative_gaps": "There are no Negative Gaps",
        "no_positive_gaps": "There are no Positive Gaps",
        "positive_gap": "Positive Gaps",
        "rank": "Rank",
        "scoring_category": "Scoring Category"
      },
      "highest_lowest": {
        "average": "Average",
        "bottom_5": "BOTTOM 5",
        "category": "Category",
        "email": "Email",
        "first_name": "First Name",
        "highest_scores": "Highest Scores",
        "item": "Item",
        "last_name": "Last Name",
        "lowest_scores": "Lowest scores",
        "mean_score": "Mean Score",
        "rank": "Rank",
        "result": "Result",
        "score": "Score",
        "scoring_category": "Scoring Category",
        "sub_competenties": "Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "career_strengths_and_results": "Career Strengths and Your Results",
        "career_sub_tracks": "Career Sub-tracks",
        "detailed_career_guide": "Detailed Career Guide",
        "diploma_qualification": "Diploma Qualification",
        "education_level": "Education Level",
        "high_school_entry_roles": "High School Entry Roles",
        "key_career_tracks_within": "Below is a list of potential job roles for each of the career tracks. Remember this list is indicative only, and not exhaustive. Do note that roles in italics require higher levels of education and / or experience.",
        "potential_areas_of_study": "Potential Areas of Study",
        "potential_roles": "Potential Roles",
        "strength_high": "Signature Strength",
        "strength_low": "Developmental Strength",
        "strength_moderate": "Potential Strength",
        "work_environment": "Work Environment",
        "your_suitability": "Your Suitability"
      },
      "potential_career_short": {
        "career": "career",
        "for_this": "for this",
        "key": "key",
        "strengths": "strengths",
        "your_scores": "Your Scores"
      },
      "single_value": {
        "factor_name": "Scoring Category",
        "question_name": "Questions"
      },
      "single_value_cluster": {
        "competency": "Competency",
        "description": "Description",
        "developmental_rating": "Developmental Rating",
        "questions": "Questions"
      },
      "strength_clusters": {
        "index_sub_factors_considered": "Thriving Index sub-factors that have been considered to provide your final score for the %{workstyle} work environment",
        "possible_roles": "Possible Roles",
        "work_environments": "Expected Work Environments"
      },
      "three_sixty_default": {
        "factor": {
          "items": "Items",
          "max": "Max Value",
          "mean": "Mean",
          "min": "Min Value",
          "standardDeviation": "Standard Deviation",
          "sum": "Sum",
          "totalResponses": "Total Responses",
          "variance": "Variance",
          "weightedMean": "Weighted Mean"
        },
        "statistic": "Statistic",
        "value": "Value"
      },
      "three_sixty_report_summary": {
        "number_by_filter_evaluations_received": "Number of %{filter} evaluations received",
        "number_of_evaluators_invited": "Number of evaluators invited",
        "number_of_evaluators_received": "Number of evaluations received",
        "number_of_evaluators_responded": "Number of evaluators responded",
        "subject": "Subject",
        "total_evaluations": "Total evaluations for this assessment"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Report"
    },
    "statuses": {
      "approved": "Approved",
      "available": "Available",
      "denied": "Denied",
      "incomplete": "Incomplete",
      "not_available": "Not available",
      "on_hold": "On hold"
    }
  },
  "simple_form": {
    "error_notification": {
      "default_message": "Please review the problems below:"
    },
    "labels": {
      "client": {
        "account_manager": "TTE Account Manager",
        "account_manager_id": "TTE Account Manager",
        "applicable_level": "Applicable Level",
        "applicable_levels": {
          "campaign": "Campaign",
          "project": "Project",
          "sub_campaign": "Sub-Campaign"
        },
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License Expiry Date",
        "licenses_used": "License Usage",
        "location": "Location",
        "logo": "Client logo",
        "memberships_count": "Users",
        "name": "Name",
        "number": "Client Number",
        "privacy_consent": "Enable data processing consent",
        "project_manager": "TTE Project Manager",
        "project_manager_id": "TTE Project Manager",
        "report_ids": "Reports",
        "subdomain": "Subdomain",
        "types": {
          "associate": "Associate",
          "corporate": "Corporate",
          "distributer": "Distributer",
          "other": "Other",
          "partner": "Partner",
          "retail": "Retail",
          "tte": "TTE"
        },
        "updated_at": "Modified Date",
        "year": "Client Year"
      },
      "membership": {
        "role": "Membership role"
      }
    },
    "no": "No",
    "placeholders": {
      "administration/assessments/assign_form": {
        "access_reports": "Access Report Rules",
        "access_reports_at": "Access Report at",
        "access_reports_at_date": "Date",
        "access_reports_at_time": "Time",
        "client_ids": "Client Tenancies",
        "manager_ids": "Managers",
        "report_ids": "Reports",
        "user_ids": "Users"
      },
      "administrator": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Client Tenancy",
        "memberships": "Client Tenancy",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "admins": {
            "admin": "Admin",
            "project_admin": "Project Admin",
            "regular": "Client Admin",
            "superadmin": "Super Admin"
          },
          "manager": "Manager",
          "member": "User",
          "regular": "Regular",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      },
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "case_study": "Case Studies",
          "hogan": "Hogan",
          "mindmill": "Mindmill",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "completed_at": "Completion Date",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "statuses": {
          "completed": "Completed",
          "finished": "finished",
          "in_progress": "Resume",
          "not_started": "New",
          "overdue": "Overdue"
        },
        "timing": "Timing",
        "types": {
          "common": "TTE Assessment",
          "hogan": "Hogan",
          "mindmill": "Mindmill Assessment"
        },
        "updated_at": "Modified Date"
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "account_manager": "TTE Account Manager",
        "account_manager_id": "TTE Account Manager",
        "applicable_level": "Applicable Level",
        "applicable_levels": {
          "campaign": "Campaign",
          "project": "Project",
          "sub_campaign": "Sub-Campaign"
        },
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License Expiry Date",
        "licenses_used": "License Usage",
        "location": "Location",
        "logo": "Client logo",
        "memberships_count": "Users",
        "name": "Name",
        "number": "Client Number",
        "privacy_consent": "Enable data processing consent",
        "project_manager": "TTE Project Manager",
        "project_manager_id": "TTE Project Manager",
        "report_ids": "Reports",
        "subdomain": "Subdomain",
        "types": {
          "associate": "Associate",
          "corporate": "Corporate",
          "distributer": "Distributer",
          "other": "Other",
          "partner": "Partner",
          "retail": "Retail",
          "tte": "TTE"
        },
        "updated_at": "Modified Date",
        "year": "Client Year"
      },
      "communication": {
        "created_at": "Created Date",
        "id": "ID",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. of Questions",
        "subfactors_count": "No. of Sub-Factors",
        "updated_at": "Modified Date"
      },
      "library": {
        "created_at": "Created Date",
        "id": "ID",
        "type": "Thumbnail",
        "updated_at": "Modified Date"
      },
      "license": {
        "id": "ID",
        "number": "License Number",
        "overuse_number": "Over Use Allowance",
        "type": "License for",
        "unlimited": "Unlimited",
        "used_number": "Used License Number"
      },
      "memebrship": {
        "active": "Active",
        "created_at": "Created Date",
        "disabled": "Disable",
        "email": "Email",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "parent": "Direct Manager",
        "parent_id": "Direct Manager",
        "report_ids": "Report IDs",
        "roles": {
          "client_admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "project_admin": "Project Admin"
        },
        "updated_at": "Modified Date",
        "user_access": "User Access"
      },
      "norm": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "description_label": "DESCRIPTION",
        "diploma_qualification": "Diploma Qualification",
        "factor_id": "Competency",
        "factor_id_label": "SELECT COMPETENCY",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "membership_id": "Assigner",
        "membership_id_label": "SELECT ASSIGNER",
        "name": "Name",
        "name_label": "ACTION ITEM",
        "planned_completed_at": "Due Date",
        "planned_completed_at_label": "SELECT DUE DATE",
        "potential_areas_of_study": "Potential Areas of Study",
        "priority": "Priority",
        "priority_label": "PRIORITY",
        "status": "Status",
        "status_label": "SELECT STATUS",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "Not Started",
          "overdue": "Overdue"
        },
        "updated_at": "Modified Date",
        "updated_by": "Edited by",
        "work_environment": "Work Environment"
      },
      "product": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "regenerate_reports": {
        "report_ids": "Reports"
      },
      "report": {
        "created_at": "Created Date",
        "id": "ID",
        "mindmill": "Load report from Mindmill",
        "mindmill_report": "Mindmill report",
        "updated_at": "Modified Date"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Client Tenancy",
        "memberships": "Client Tenancy",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "admins": {
            "admin": "Admin",
            "project_admin": "Project Admin",
            "regular": "Client Admin",
            "superadmin": "Super Admin"
          },
          "manager": "Manager",
          "member": "User",
          "regular": "Regular",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      },
      "user_form": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "parent": "Direct Manager",
        "parent_id": "Direct Manager",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "updated_at": "Modified Date"
      }
    },
    "required": {
      "mark": "*",
      "text": "required"
    },
    "yes": "Yes"
  },
  "subjects": {
    "statuses": {
      "completed": "Completed",
      "done": "Done",
      "not_completed": "Not Completed"
    }
  },
  "support": {
    "array": {
      "last_word_connector": ", and ",
      "two_words_connector": " and ",
      "words_connector": ", "
    }
  },
  "threesixty": {
    "add": "Add",
    "and": "And",
    "approve_all": "Approve All",
    "approve_all_successful": "Approved all nominations",
    "approve_evaluations": "Approve Evaluations",
    "approve_nominations": "Approve Nominations",
    "approve_reports": "Approve Reports",
    "approved": "Approved",
    "approving_mail_sent": "Mail for approving nomination has been sent to managers",
    "as_my": "as my",
    "back_to_tasks": "Back to tasks",
    "cancel": "Cancel",
    "decline": "Decline",
    "decline_invite": "Decline Invite",
    "denied": "Denied",
    "deny_all": "Deny All",
    "deny_all_successful": "Denied all nominations",
    "email_approve_request": "Email Approval Request",
    "evaluation": "Evaluation",
    "evaluations": "Evaluations",
    "help": "Help",
    "language": "Language",
    "my_projects": "My Projects",
    "nominate": "Nominate",
    "nominate_evaluators": "Nominate Evaluators to",
    "nomination": "Nomination",
    "nominations": "Nominations",
    "or": "Or",
    "page_title": "Signify 360° Review - Apply Level",
    "remind_all": "Remind All",
    "remind_mail_sent": "Reminders sent to evaluators who haven't completed the evaluation",
    "reports": "Reports",
    "select_relationnship": "Select Relationship",
    "select_relationship": "Select Relationship",
    "setup_nominations": "Set up nominations",
    "total_progress": "Total progress",
    "user_name_input_placeholder": "type name or email...",
    "validation_errors": "Validation Errors",
    "view_nominations": "View nominations",
    "waiting": "Waiting"
  },
  "time": {
    "am": "am",
    "formats": {
      "date": "%d/%m/%y",
      "datetimepicker_client": "DD/MM/YYYY hh:mm A",
      "datetimepicker_server": "%d/%m/%Y %I:%M %p",
      "datetimepicker_without_time_client": "DD/MM/YYYY",
      "datetimepicker_without_time_server": "%d/%m/%Y",
      "default": "%a, %d %b %Y %H:%M:%S %z",
      "devise": {
        "mailer": {
          "invitation_instructions": {
            "accept_until_format": "%B %d, %Y %I:%M %p"
          }
        }
      },
      "iso8601_without_seconds_and_timezone": "%Y-%m-%dT%H:%M",
      "long": "%B %d, %Y %H:%M",
      "short": "%d %b %Y / %H:%M",
      "short_date": "%-d %b %Y"
    },
    "pm": "pm"
  },
  "validations": {
    "character_range": "Your response must be at least %{min} and no more than %{max} characters.",
    "date": "Your response must be a valid date (dd/mm/yyyy)",
    "each_group_contains": "Each group needs to contain not less than %{min} and not more than %{max} items",
    "email": "Your response must be a valid email",
    "issue": "Issue",
    "least": "Please answer at least %{min} choice(s).",
    "least_hotspot": "Please answer at least %{min} choice(s).",
    "max_length": "Your response must be no more than %{max} characters.",
    "min_length": "Your response must be at least %{min} characters.",
    "must_rank_between": "Please assign a value from %{min} to %{max} for each item. Values may not be repeated.",
    "must_select": "Please select from %{min} to %{max} choices",
    "number": "Your response must be a number",
    "please_answer_question": "Please answer this question",
    "please_record_and_save_video_first": "Please record and save the video before you continue",
    "range": "Please answer at least %{min} and no more than %{max} choice(s).",
    "text": "Your response must not contain a numbers",
    "title": "Sorry, you cannot continue until you correct the following:"
  },
  "views": {
    "pagination": {
      "first": "&laquo; First",
      "last": "Last &raquo;",
      "next": "Next &rsaquo;",
      "previous": "&lsaquo; Prev",
      "truncate": "&hellip;"
    }
  },
  "yes": "Yes"
});

I18n.translations || (I18n.translations = {});
I18n.translations["en"] = I18n.extend((I18n.translations["en"] || {}), {
  "activerecord": {
    "attributes": {
      "dimension": {
        "active": "Active",
        "craeted_at": "Created",
        "favourite": "Favourite",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified"
      },
      "user": {
        "active": "Active",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "E-mail",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "remember_me": "Remember me",
        "reset_password_token": "Reset password token",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "superadmin": "Super Admin",
          "user": "User"
        },
        "unlock_token": "Unlock token"
      }
    },
    "errors": {
      "messages": {
        "record_invalid": "Validation failed: %{errors}",
        "restrict_dependent_destroy": {
          "has_many": "Cannot delete record because dependent %{record} exist",
          "has_one": "Cannot delete record because a dependent %{record} exists"
        }
      }
    },
    "models": {
      "dimension": "Dimensions",
      "user": "Users"
    }
  },
  "administration": {
    "actions": "Actions",
    "active": "Active",
    "base": {
      "top_sidebar": {
        "search": "Search...",
        "sign_out_message": {
          "body": "<p>Are you sure you want to log out?</p> <p>Press No if youwant to continue work. Press Yes to logout current user.</p>",
          "title": "Log <strong>Out</strong> ?"
        }
      }
    },
    "breadcrumbs": {
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "home": "Dashboard",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users"
    },
    "clear": "Clear",
    "close": "Close",
    "copy": "Copy",
    "dimensions": {
      "copy": {
        "error": "Dimension #%{id} was not copied."
      },
      "destroy": {
        "successfully_destroyed": "Dimension #%{id} was successfully destroyed."
      },
      "edit": {
        "header": "Edit dimension"
      },
      "index": {
        "title": "Dimensions"
      },
      "new": {
        "header": "New dimension"
      },
      "toggle_status": {
        "successfully": "Dimension was successfully updated."
      }
    },
    "disable": "Disable",
    "edit": "Edit",
    "enable": "Enable",
    "meta_title": "Administration panel",
    "navigation": {
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "home": "Dashboard",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users"
    },
    "new": "New",
    "no_data_found": "No data found",
    "noty": {
      "error_500": "Something went wrong. Contact your administrator."
    },
    "profiles": {
      "edit": {
        "success": "Profile was successfully updated."
      }
    },
    "psychometrics": "Psychometrics",
    "search": "Search",
    "show": "Show",
    "update": "Update",
    "users": {
      "create": {
        "successfully": "User was successfully created."
      },
      "destroy": {
        "successfully": "User was successfully destroyed."
      },
      "edit": {
        "title": "Edit user"
      },
      "form": {
        "choose": " - Choose - "
      },
      "index": {
        "title": "Users"
      },
      "list": {
        "filterrific": {
          "with_role": {
            "administrators": "Administrators",
            "all": "All",
            "users": "Users"
          }
        }
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this user?</p>\n",
            "title": "Delete <strong>User</strong> ?"
          }
        },
        "tooltips": {
          "change_password": "Change password",
          "chart": "View user report",
          "delete": "Delete user",
          "edit": "Edit user",
          "mail": "Send mail",
          "sign_in": "Sign in as user"
        }
      },
      "sidebar": {
        "disable": "Disable",
        "edit_user": "Edit User",
        "email": "E-mail",
        "enable": "Enable",
        "export_users": "Export Users",
        "import_users": "Import Users",
        "login_as_user": "Login as User",
        "new_user": "New User",
        "title": "User's options",
        "view_report": "View Report(s)"
      },
      "toggle_status": {
        "successfully": "User was successfully updated."
      },
      "update": {
        "successfully": "User was successfully updated."
      }
    }
  },
  "confirmation": {
    "default_body": "Are you sure?",
    "default_title": "Confirmation"
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
      "meta_title": "Sign in to administration panel",
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
          "submit": "Log In",
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
      "timeout": "Your session expired. Please sign in again to continue.",
      "unauthenticated": "You need to sign in or sign up before continuing.",
      "unconfirmed": "You have to confirm your email address before continuing."
    },
    "invitations": {
      "edit": {
        "header": "Set your password",
        "submit_button": "Set my password"
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
      "invitation_instructions": {
        "accept": "Accept invitation",
        "accept_until": "This invitation will be due in %{due_date}.",
        "hello": "Hello %{email}",
        "ignore": "If you don't want to accept the invitation, please ignore this email.<br />\nYour account won't be created until you access the link above and set your password.",
        "someone_invited_you": "Someone has invited you to %{url}, you can accept it through the link below.",
        "subject": "Invitation instructions"
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
        "new_password": "New password"
      },
      "new": {
        "forgot_your_password": "Forgot your password?",
        "send_me_reset_password_instructions": "Send me reset password instructions"
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
        "sign_up": "Sign up"
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
        "sign_in": "Sign in"
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
      "unlocked": "Your account has been unlocked successfully. Please sign in to continue."
    }
  },
  "errors": {
    "connection_refused": "Oops! Failed to connect to the Web Console middleware.\nPlease make sure a rails development server is running.\n",
    "format": "%{attribute} %{message}",
    "messages": {
      "accepted": "must be accepted",
      "already_confirmed": "was already confirmed, please try signing in",
      "blank": "can't be blank",
      "confirmation": "doesn't match %{attribute}",
      "confirmation_period_expired": "needs to be confirmed within %{period}, please request a new one",
      "empty": "can't be empty",
      "equal_to": "must be equal to %{count}",
      "even": "must be even",
      "exclusion": "is reserved",
      "expired": "has expired, please request a new one",
      "greater_than": "must be greater than %{count}",
      "greater_than_or_equal_to": "must be greater than or equal to %{count}",
      "inclusion": "is not included in the list",
      "invalid": "is invalid",
      "less_than": "must be less than %{count}",
      "less_than_or_equal_to": "must be less than or equal to %{count}",
      "model_invalid": "Validation failed: %{errors}",
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
  "simple_form": {
    "error_notification": {
      "default_message": "Please review the problems below:"
    },
    "no": "No",
    "placeholders": {
      "administrator": {
        "active": "Active",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "E-mail",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "superadmin": "Super Admin",
          "user": "User"
        }
      },
      "dimension": {
        "active": "Active",
        "craeted_at": "Created",
        "favourite": "Favourite",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified"
      },
      "user": {
        "active": "Active",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "E-mail",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "superadmin": "Super Admin",
          "user": "User"
        }
      }
    },
    "required": {
      "mark": "*",
      "text": "required"
    },
    "yes": "Yes"
  },
  "support": {
    "array": {
      "last_word_connector": ", and ",
      "two_words_connector": " and ",
      "words_connector": ", "
    }
  },
  "time": {
    "am": "am",
    "formats": {
      "default": "%a, %d %b %Y %H:%M:%S %z",
      "devise": {
        "mailer": {
          "invitation_instructions": {
            "accept_until_format": "%B %d, %Y %I:%M %p"
          }
        }
      },
      "long": "%B %d, %Y %H:%M",
      "short": "%d %b %H:%M"
    },
    "pm": "pm"
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
